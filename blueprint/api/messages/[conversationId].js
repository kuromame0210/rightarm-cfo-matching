// API Route: /api/messages/[conversationId]
// 特定の会話のメッセージを取得・送信

import { messageManager } from '../../message-manager.js';
import { verifyFirebaseToken } from '../auth/verify.js';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { conversationId } = req.query;

  if (!conversationId) {
    return res.status(400).json({ error: '会話IDが必要です' });
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

    const userId = authResult.user.uid;

    if (req.method === 'GET') {
      // メッセージ一覧を取得
      const { limit = 50, offset = 0 } = req.query;
      
      const result = await messageManager.getConversationMessages(
        conversationId, 
        parseInt(limit), 
        parseInt(offset)
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // 会話を既読にマーク
      await messageManager.markConversationAsRead(conversationId, userId);

      return res.status(200).json({
        success: true,
        messages: result.messages
      });

    } else if (req.method === 'POST') {
      // 新しいメッセージを送信
      const { message_text, message_type = 'text', metadata = null } = req.body;

      if (!message_text || message_text.trim() === '') {
        return res.status(400).json({ error: 'メッセージテキストが必要です' });
      }

      const result = await messageManager.sendMessage(
        conversationId,
        userId,
        message_text.trim(),
        message_type,
        metadata
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      return res.status(201).json({
        success: true,
        message: result.message
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('メッセージAPI エラー:', error);
    return res.status(500).json({ 
      error: 'サーバーエラーが発生しました',
      details: error.message 
    });
  }
}