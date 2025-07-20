// RightArm v3 Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'
import { TABLES } from './constants'

export { TABLES }

// 環境変数の検証とエラーハンドリング
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// クライアントサイドではより寛容なエラーハンドリング
const isClient = typeof window !== 'undefined'

if (!supabaseUrl) {
  const errorMsg = 'NEXT_PUBLIC_SUPABASE_URL is required. Please check your environment variables.'
  if (isClient) {
    console.error(errorMsg)
  } else {
    throw new Error(errorMsg)
  }
}

if (!supabaseAnonKey) {
  const errorMsg = 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your environment variables.'
  if (isClient) {
    console.error(errorMsg)
  } else {
    throw new Error(errorMsg)
  }
}

// シングルトンパターンでSupabaseクライアントを作成
let supabaseInstance: ReturnType<typeof createClient> | null = null

// クライアントサイド用Supabaseクライアント
export const supabase = (() => {
  if (supabaseInstance) {
    return supabaseInstance
  }
  
  // 環境変数が設定されていない場合のフォールバック処理
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not properly set. Using fallback configuration.')
    // ダミークライアントを作成（エラーを防ぐため）
    supabaseInstance = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
    return supabaseInstance
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
})()

// サーバーサイド用Supabaseクライアント（管理者権限）
// 遅延初期化でクライアントサイドでのエラーを防ぐ
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseAdmin = () => {
  // クライアントサイドでは実行しない
  if (typeof window !== 'undefined') {
    // クライアントサイドでは通常のクライアントを返す
    return supabase
  }

  // 既に初期化済みなら再利用
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Server-side operations may fail.')
    // 開発環境では警告のみ、本番環境では例外を投げる
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for production.')
    }
    // 開発環境では匿名キーでフォールバック（制限された機能）
    supabaseAdminInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    return supabaseAdminInstance
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return supabaseAdminInstance
}

// 後方互換性のため
export const supabaseAdmin = getSupabaseAdmin()

// 新アーキテクチャ対応 Database型定義
export interface Database {
  public: {
    Tables: {
      cfo_profiles: {
        Row: {
          cfo_user_id: string        // PK, auth.users(id) FK
          avatar_url: string | null  // アイコン画像の公開 URL
          cfo_name: string | null
          cfo_display_name: string | null
          cfo_location: string | null      // 例: 千葉県千葉市
          cfo_availability: string | null  // 稼働メモ
          cfo_fee_min: number | null       // 想定月額下限(円)
          cfo_fee_max: number | null       // 想定月額上限(円)
          cfo_skills: string[]             // ["IPO","M&A"] JSONB配列
          cfo_raw_profile: string          // 経歴・紹介文を丸ごと貼付
          created_at: string
          updated_at: string
        }
        Insert: {
          cfo_user_id: string
          avatar_url?: string | null
          cfo_name?: string | null
          cfo_display_name?: string | null
          cfo_location?: string | null
          cfo_availability?: string | null
          cfo_fee_min?: number | null
          cfo_fee_max?: number | null
          cfo_skills?: string[]
          cfo_raw_profile: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          cfo_user_id?: string
          avatar_url?: string | null
          cfo_name?: string | null
          cfo_display_name?: string | null
          cfo_location?: string | null
          cfo_availability?: string | null
          cfo_fee_min?: number | null
          cfo_fee_max?: number | null
          cfo_skills?: string[]
          cfo_raw_profile?: string
          created_at?: string
          updated_at?: string
        }
      }
      biz_profiles: {
        Row: {
          biz_user_id: string        // PK, auth.users(id) FK
          avatar_url: string | null  // 企業ロゴ / アイコン URL
          biz_company_name: string
          biz_location: string | null
          biz_revenue_min: number | null  // 年商下限(円)
          biz_revenue_max: number | null  // 年商上限(円)
          biz_issues: string[]            // ["資金調達","管理会計"] JSONB配列
          biz_raw_profile: string         // 企業紹介文
          created_at: string
          updated_at: string
        }
        Insert: {
          biz_user_id: string
          avatar_url?: string | null
          biz_company_name: string
          biz_location?: string | null
          biz_revenue_min?: number | null
          biz_revenue_max?: number | null
          biz_issues?: string[]
          biz_raw_profile: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          biz_user_id?: string
          avatar_url?: string | null
          biz_company_name?: string
          biz_location?: string | null
          biz_revenue_min?: number | null
          biz_revenue_max?: number | null
          biz_issues?: string[]
          biz_raw_profile?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          liker_id: string   // auth.users FK
          target_id: string  // auth.users FK
          created_at: string
        }
        Insert: {
          liker_id: string
          target_id: string
          created_at?: string
        }
        Update: {
          liker_id?: string
          target_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          review_id: number    // bigserial PK
          reviewer_id: string  // uuid FK→auth.users
          target_id: string    // uuid FK→auth.users
          rating: number       // 1-5
          comment: string | null
          created_at: string
        }
        Insert: {
          review_id?: number
          reviewer_id: string
          target_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          review_id?: number
          reviewer_id?: string
          target_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          msg_id: number           // bigserial PK
          sender_id: string        // uuid FK→auth.users
          receiver_id: string      // uuid FK→auth.users
          msg_type: 'chat' | 'scout' // default 'chat'
          body: string
          sent_at: string
        }
        Insert: {
          msg_id?: number
          sender_id: string
          receiver_id: string
          msg_type?: 'chat' | 'scout'
          body: string
          sent_at?: string
        }
        Update: {
          msg_id?: number
          sender_id?: string
          receiver_id?: string
          msg_type?: 'chat' | 'scout'
          body?: string
          sent_at?: string
        }
      }
      attachments: {
        Row: {
          file_id: number      // bigserial PK
          file_url: string     // Storage public URL
          file_name: string | null
          msg_id: number | null       // FK→messages
          cfo_user_id: string | null  // FK→cfo_profiles
          biz_user_id: string | null  // FK→biz_profiles
          uploaded_by: string         // FK→auth.users
          created_at: string
        }
        Insert: {
          file_id?: number
          file_url: string
          file_name?: string | null
          msg_id?: number | null
          cfo_user_id?: string | null
          biz_user_id?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          file_id?: number
          file_url?: string
          file_name?: string | null
          msg_id?: number | null
          cfo_user_id?: string | null
          biz_user_id?: string | null
          uploaded_by?: string
          created_at?: string
        }
      }
    }
  }
}

// 型安全なSupabaseクライアント
export const typedSupabase = supabase as any // 一時的に any で型を回避
export const typedSupabaseAdmin = supabaseAdmin as any // 一時的に any で型を回避

// ヘルパー関数
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// テーブル操作ヘルパー
// この関数は新アーキテクチャでは使用されません
// プロフィール情報の取得は /api/profile を使用してください

// この関数は新アーキテクチャでは使用されません
// プロフィール情報の取得は /api/profile を使用してください

// この関数は新アーキテクチャでは使用されません
// プロフィール情報の取得は /api/profile を使用してください

// これらの関数は新アーキテクチャでは使用されません
// スキル情報の取得は /api/master/skills を使用してください