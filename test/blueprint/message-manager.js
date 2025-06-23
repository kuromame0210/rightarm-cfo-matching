// メッセージ管理システム
// Supabaseを使用してメッセージング機能を提供

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase設定が見つかりません。環境変数を確認してください。');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class MessageManager {
  constructor() {
    this.supabase = supabase;
  }

  // 会話の作成または取得
  async getOrCreateConversation(companyId, cfoId) {
    try {
      // 既存の会話を検索
      const { data: existingConversation, error: fetchError } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('company_id', companyId)
        .eq('cfo_id', cfoId)
        .single();

      if (existingConversation) {
        return { success: true, conversation: existingConversation };
      }

      // 会話が存在しない場合は新規作成
      const { data: newConversation, error: createError } = await this.supabase
        .from('conversations')
        .insert({
          company_id: companyId,
          cfo_id: cfoId,
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return { success: true, conversation: newConversation };
    } catch (error) {
      console.error('会話の作成・取得エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // ユーザーの全会話を取得
  async getUserConversations(userId) {
    try {
      const { data: conversations, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          company_profile:company_profiles(company_name, photo_url),
          cfo_profile:cfo_profiles(first_name, last_name),
          latest_message:messages(message_text, created_at, sender_id)
        `)
        .or(`company_id.eq.${userId},cfo_id.eq.${userId}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      // 最新メッセージで並び替え
      const conversationsWithLatestMessage = conversations.map(conv => {
        const latestMessage = conv.latest_message?.[0] || null;
        return {
          ...conv,
          latest_message: latestMessage,
          other_user: conv.company_id === userId ? conv.cfo_profile : conv.company_profile
        };
      });

      return { success: true, conversations: conversationsWithLatestMessage };
    } catch (error) {
      console.error('会話一覧の取得エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // 会話内のメッセージを取得
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(display_name, photo_url, user_type)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return { success: true, messages };
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // メッセージを送信
  async sendMessage(conversationId, senderId, messageText, messageType = 'text', metadata = null) {
    try {
      const { data: message, error: messageError } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: messageText,
          message_type: messageType,
          metadata: metadata
        })
        .select(`
          *,
          sender:profiles(display_name, photo_url, user_type)
        `)
        .single();

      if (messageError) {
        throw messageError;
      }

      // 会話の更新日時を更新
      await this.supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { success: true, message };
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // メッセージを既読にする
  async markMessageAsRead(messageId, userId) {
    try {
      const { error } = await this.supabase
        .from('message_read_status')
        .upsert({
          message_id: messageId,
          user_id: userId,
          read_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('既読マークエラー:', error);
      return { success: false, error: error.message };
    }
  }

  // 会話内の全未読メッセージを既読にする
  async markConversationAsRead(conversationId, userId) {
    try {
      // 会話内の未読メッセージIDを取得
      const { data: unreadMessages, error: fetchError } = await this.supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId); // 自分が送信したメッセージ以外

      if (fetchError) {
        throw fetchError;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        return { success: true };
      }

      // 既読状態をバッチで挿入
      const readStatusInserts = unreadMessages.map(msg => ({
        message_id: msg.id,
        user_id: userId,
        read_at: new Date().toISOString()
      }));

      const { error: insertError } = await this.supabase
        .from('message_read_status')
        .upsert(readStatusInserts);

      if (insertError) {
        throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('会話既読マークエラー:', error);
      return { success: false, error: error.message };
    }
  }

  // 未読メッセージ数を取得
  async getUnreadCount(userId) {
    try {
      const { data: conversations, error } = await this.supabase
        .from('conversations')
        .select('id')
        .or(`company_id.eq.${userId},cfo_id.eq.${userId}`)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      let totalUnreadCount = 0;

      for (const conv of conversations) {
        const { count, error: countError } = await this.supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .not('id', 'in', 
            `(SELECT message_id FROM message_read_status WHERE user_id = '${userId}')`
          );

        if (!countError) {
          totalUnreadCount += count || 0;
        }
      }

      return { success: true, unreadCount: totalUnreadCount };
    } catch (error) {
      console.error('未読数取得エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // リアルタイムメッセージ監視を開始
  subscribeToMessages(conversationId, callback) {
    const subscription = this.supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        callback
      )
      .subscribe();

    return subscription;
  }

  // リアルタイム会話監視を開始
  subscribeToConversations(userId, callback) {
    const subscription = this.supabase
      .channel(`conversations:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `or(company_id.eq.${userId},cfo_id.eq.${userId})`
        }, 
        callback
      )
      .subscribe();

    return subscription;
  }

  // 面談予約メッセージを送信
  async sendMeetingRequest(conversationId, senderId, meetingDetails) {
    const meetingMessage = `面談のご提案をさせていただきます。
    
日時: ${meetingDetails.datetime}
場所: ${meetingDetails.location || 'オンライン'}
所要時間: ${meetingDetails.duration || '1時間'}

ご都合はいかがでしょうか？`;

    return await this.sendMessage(
      conversationId, 
      senderId, 
      meetingMessage, 
      'meeting_request',
      meetingDetails
    );
  }

  // 会話をアーカイブ
  async archiveConversation(conversationId) {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('会話アーカイブエラー:', error);
      return { success: false, error: error.message };
    }
  }

  // 会話をブロック
  async blockConversation(conversationId) {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({ status: 'blocked' })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('会話ブロックエラー:', error);
      return { success: false, error: error.message };
    }
  }
}

// デフォルトのインスタンスをエクスポート
export const messageManager = new MessageManager();

// 使用例コメント:
/*
import { messageManager } from './message-manager.js';

// 会話の作成
const conversation = await messageManager.getOrCreateConversation('company_id', 'cfo_id');

// メッセージ送信
const message = await messageManager.sendMessage(conversation.id, 'sender_id', 'こんにちは！');

// 会話一覧取得
const conversations = await messageManager.getUserConversations('user_id');

// メッセージ一覧取得
const messages = await messageManager.getConversationMessages(conversation.id);

// リアルタイム監視
const subscription = messageManager.subscribeToMessages(conversation.id, (payload) => {
  console.log('新しいメッセージ:', payload.new);
});

// 監視停止
subscription.unsubscribe();
*/