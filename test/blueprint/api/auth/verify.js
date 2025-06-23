// Firebase Admin SDK を使用したIDトークン検証API
// Next.js API Routes または Express.js で使用

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Firebase Admin の初期化（1回のみ実行）
if (!admin.apps.length) {
  // Firebase Admin SDK の秘密鍵を設定
  // 本番環境では環境変数から読み込み
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

// Supabase Service Role クライアント（管理者権限）
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Next.js API Route ハンドラー
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken, userData } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'IDトークンが必要です' });
    }

    // Firebase Admin SDK でIDトークンを検証
    const decodedToken = await admin.auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // トークンが有効な場合、Supabaseにユーザー情報を保存
    const profileData = {
      id: uid,
      email: email,
      display_name: userData.displayName || name,
      photo_url: userData.photoURL || picture,
      user_type: userData.userType || null,
      updated_at: new Date().toISOString()
    };

    // Supabaseにプロフィールを保存（upsert）
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ 
        error: 'プロフィール保存に失敗しました',
        details: error.message 
      });
    }

    // 成功レスポンス
    res.status(200).json({
      success: true,
      message: '認証に成功しました',
      user: {
        uid: uid,
        email: email,
        displayName: profileData.display_name,
        userType: profileData.user_type,
        profile: data
      }
    });

  } catch (error) {
    console.error('認証エラー:', error);
    
    // Firebase認証エラーの場合
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'IDトークンの有効期限が切れています' });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: '無効なIDトークンです' });
    }

    // その他のエラー
    res.status(500).json({ 
      error: '認証処理でエラーが発生しました',
      details: error.message 
    });
  }
}

// Express.js用のエクスポート関数
export async function verifyTokenAndCreateProfile(idToken, userData) {
  try {
    // Firebase Admin SDK でIDトークンを検証
    const decodedToken = await admin.auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // プロフィールデータを準備
    const profileData = {
      id: uid,
      email: email,
      display_name: userData.displayName || name,
      photo_url: userData.photoURL || picture,
      user_type: userData.userType || null,
      updated_at: new Date().toISOString()
    };

    // Supabaseにプロフィールを保存
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`プロフィール保存エラー: ${error.message}`);
    }

    return {
      success: true,
      user: {
        uid: uid,
        email: email,
        displayName: profileData.display_name,
        userType: profileData.user_type,
        profile: data
      }
    };

  } catch (error) {
    throw error;
  }
}