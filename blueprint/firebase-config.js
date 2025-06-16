// Firebase設定ファイル
// Firebaseコンソールから取得した設定情報を入力してください

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase設定（実際の値に置き換えてください）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Google認証プロバイダー
const googleProvider = new GoogleAuthProvider();

// 認証関数の定義
export const authFunctions = {
  // メール・パスワードでログイン
  signInWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      return { user: userCredential.user, idToken };
    } catch (error) {
      throw new Error(`ログインに失敗しました: ${error.message}`);
    }
  },

  // メール・パスワードでユーザー作成
  createUserWithEmail: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      return { user: userCredential.user, idToken };
    } catch (error) {
      throw new Error(`ユーザー作成に失敗しました: ${error.message}`);
    }
  },

  // Googleアカウントでログイン
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      return { user: result.user, idToken };
    } catch (error) {
      throw new Error(`Google認証に失敗しました: ${error.message}`);
    }
  },

  // ログアウト
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`ログアウトに失敗しました: ${error.message}`);
    }
  },

  // 認証状態の監視
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // 現在のユーザーのIDトークンを取得
  getCurrentUserIdToken: async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  }
};

export { auth };