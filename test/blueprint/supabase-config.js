// Supabase設定ファイル
// Supabaseプロジェクトから取得した設定情報を入力してください

import { createClient } from '@supabase/supabase-js';

// Supabase設定（実際の値に置き換えてください）
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// Supabaseクライアントの初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// プロフィール管理関数
export const profileFunctions = {
  // ユーザープロフィールを作成または更新
  upsertProfile: async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        throw new Error(`プロフィール保存に失敗しました: ${error.message}`);
      }

      return data[0];
    } catch (error) {
      throw error;
    }
  },

  // プロフィールを取得
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
        throw new Error(`プロフィール取得に失敗しました: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // プロフィールを削除
  deleteProfile: async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(`プロフィール削除に失敗しました: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
};