// CFO×企業マッチング - 新アーキテクチャ Database Table Constants
// 6テーブル + Supabase Auth 構成

export const TABLES = {
  // === 新アーキテクチャ Core Tables ===
  CFO_PROFILES: 'cfo_profiles',        // CFO固有プロフィール
  BIZ_PROFILES: 'biz_profiles',        // 企業固有プロフィール  
  LIKES: 'likes',                      // 「気になる」ワンタップ
  REVIEWS: 'reviews',                  // ★1-5+コメント
  MESSAGES: 'messages',                // チャット & スカウト (msg_type='scout')
  ATTACHMENTS: 'attachments',          // メッセージ/プロフィール添付
  
  // === 認証・ユーザー管理 ===
  USERS: 'auth.users',                 // Supabase Auth ユーザーテーブル (直接は使用非推奨)
  
  
  // === 将来の機能拡張用テーブル ===
  // 現在未実装、将来追加予定
  CONTRACTS: 'contracts',              // 契約管理
  INVOICES: 'invoices',                // 請求書管理
  PAYMENTS: 'payments',                // 支払い管理
  ACTIVITIES: 'activities',            // アクティビティログ
} as const;

// テーブル名の型定義
export type TableName = typeof TABLES[keyof typeof TABLES];

// 使用例：
// const { data } = await supabase.from(TABLES.USERS).select('*');