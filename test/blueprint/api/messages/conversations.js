// API Route: /api/messages/conversations
// ユーザーの会話一覧を取得

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

  if (req.method !== 'GET') {
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

    const userId = authResult.user.uid;

    // 会話一覧を取得
    const result = await messageManager.getUserConversations(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      conversations: result.conversations
    });

  } catch (error) {
    console.error('会話一覧取得API エラー:', error);
    return res.status(500).json({ 
      error: 'サーバーエラーが発生しました',
      details: error.message 
    });
  }
}