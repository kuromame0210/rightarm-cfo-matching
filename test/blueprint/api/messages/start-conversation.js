// API Route: /api/messages/start-conversation
// 新しい会話を開始

import { messageManager } from '../../message-manager.js';
import { verifyFirebaseToken } from '../auth/verify.js';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Firebase認証トークンの検証
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: '認証トークンが必要です' });
    }

    const token = authHeader.split('Bearer ')[1];
    const authResult = await verifyFirebaseToken(token);
    
    if (!authResult.success) {
      return res.status(401).json({ error: '認証に失敗しました' });
    }

    const currentUserId = authResult.user.uid;
    const { target_user_id, initial_message } = req.body;

    if (!target_user_id) {
      return res.status(400).json({ error: '対象ユーザーIDが必要です' });
    }

    if (!initial_message || initial_message.trim() === '') {
      return res.status(400).json({ error: '初回メッセージが必要です' });
    }

    // 現在のユーザーのプロフィールを取得してuser_typeを判定
    const profileResult = await messageManager.supabase
      .from('profiles')
      .select('user_type')
      .eq('id', currentUserId)
      .single();

    if (profileResult.error) {
      return res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
    }

    const currentUserType = profileResult.data.user_type;
    
    // 対象ユーザーのプロフィールも取得
    const targetProfileResult = await messageManager.supabase
      .from('profiles')
      .select('user_type')
      .eq('id', target_user_id)
      .single();

    if (targetProfileResult.error) {
      return res.status(400).json({ error: '対象ユーザーが見つかりません' });
    }

    const targetUserType = targetProfileResult.data.user_type;

    // 企業とCFOの組み合わせかチェック
    if ((currentUserType === 'company' && targetUserType !== 'cfo') ||
        (currentUserType === 'cfo' && targetUserType !== 'company')) {
      return res.status(400).json({ error: '企業とCFOの間でのみ会話を開始できます' });
    }

    // 会話のパラメータを適切に設定
    const companyId = currentUserType === 'company' ? currentUserId : target_user_id;
    const cfoId = currentUserType === 'cfo' ? currentUserId : target_user_id;

    // 会話を作成または取得
    const conversationResult = await messageManager.getOrCreateConversation(companyId, cfoId);

    if (!conversationResult.success) {
      return res.status(500).json({ error: conversationResult.error });
    }

    const conversation = conversationResult.conversation;

    // 初回メッセージを送信
    const messageResult = await messageManager.sendMessage(
      conversation.id,
      currentUserId,
      initial_message.trim(),
      'text'
    );

    if (!messageResult.success) {
      return res.status(500).json({ error: messageResult.error });
    }

    return res.status(201).json({
      success: true,
      conversation: conversation,
      initial_message: messageResult.message
    });

  } catch (error) {
    console.error('会話開始API エラー:', error);
    return res.status(500).json({ 
      error: 'サーバーエラーが発生しました',
      details: error.message 
    });
  }
}