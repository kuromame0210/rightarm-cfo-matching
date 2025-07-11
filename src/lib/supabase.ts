// RightArm v3 Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'
import { TABLES } from './constants'

export { TABLES }

// 環境変数の検証とエラーハンドリング
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your .env.local file.')
}

// クライアントサイド用Supabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバーサイド用Supabaseクライアント（管理者権限）
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Server-side operations may fail.')
    // 開発環境では警告のみ、本番環境では例外を投げる
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for production.')
    }
    // 開発環境では匿名キーでフォールバック（制限された機能）
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// Database型定義（基本型）
export interface Database {
  public: {
    Tables: {
      rextrix_users: {
        Row: {
          id: string
          supabase_auth_id: string
          email: string
          password_hash: string | null
          user_type: 'company' | 'cfo'
          status: 'active' | 'inactive' | 'suspended' | 'pending'
          email_verified: boolean
          profile_image_url: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          supabase_auth_id: string
          email: string
          password_hash?: string | null
          user_type: 'company' | 'cfo'
          status?: 'active' | 'inactive' | 'suspended' | 'pending'
          email_verified?: boolean
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          supabase_auth_id?: string
          email?: string
          password_hash?: string | null
          user_type?: 'company' | 'cfo'
          status?: 'active' | 'inactive' | 'suspended' | 'pending'
          email_verified?: boolean
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      rextrix_user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          nickname: string | null
          introduction: string | null
          phone_number: string | null
          region: string | null
          work_preference: string | null
          compensation_range: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          nickname?: string | null
          introduction?: string | null
          phone_number?: string | null
          region?: string | null
          work_preference?: string | null
          compensation_range?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          nickname?: string | null
          introduction?: string | null
          phone_number?: string | null
          region?: string | null
          work_preference?: string | null
          compensation_range?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rextrix_companies: {
        Row: {
          id: string
          user_id: string
          company_name: string
          business_name: string | null
          description: string | null
          industry: string | null
          region: string | null
          employee_count: string | null
          revenue_range: 'under_100m' | '100m_1b' | '1b_10b' | '10b_30b' | 'over_50b' | 'private' | null
          website_url: string | null
          established_year: number | null
          is_recruiting: boolean
          recruitment_urgency: 'low' | 'medium' | 'high'
          expected_timeline: string | null
          work_style: string | null
          compensation_offer: string | null
          challenge_background: string | null
          cfo_requirements: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          business_name?: string | null
          description?: string | null
          industry?: string | null
          region?: string | null
          employee_count?: string | null
          revenue_range?: 'under_100m' | '100m_1b' | '1b_10b' | '10b_30b' | 'over_50b' | 'private' | null
          website_url?: string | null
          established_year?: number | null
          is_recruiting?: boolean
          recruitment_urgency?: 'low' | 'medium' | 'high'
          expected_timeline?: string | null
          work_style?: string | null
          compensation_offer?: string | null
          challenge_background?: string | null
          cfo_requirements?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          business_name?: string | null
          description?: string | null
          industry?: string | null
          region?: string | null
          employee_count?: string | null
          revenue_range?: 'under_100m' | '100m_1b' | '1b_10b' | '10b_30b' | 'over_50b' | 'private' | null
          website_url?: string | null
          established_year?: number | null
          is_recruiting?: boolean
          recruitment_urgency?: 'low' | 'medium' | 'high'
          expected_timeline?: string | null
          work_style?: string | null
          compensation_offer?: string | null
          challenge_background?: string | null
          cfo_requirements?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rextrix_cfos: {
        Row: {
          id: string
          user_id: string
          experience_years: number | null
          experience_summary: string | null
          achievements: any | null
          certifications: any | null
          is_available: boolean
          max_concurrent_projects: number
          rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          experience_years?: number | null
          experience_summary?: string | null
          achievements?: any | null
          certifications?: any | null
          is_available?: boolean
          max_concurrent_projects?: number
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          experience_years?: number | null
          experience_summary?: string | null
          achievements?: any | null
          certifications?: any | null
          is_available?: boolean
          max_concurrent_projects?: number
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      rextrix_skill_tags: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          usage_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          usage_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          usage_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      rextrix_challenge_tags: {
        Row: {
          id: string
          name: string
          description: string | null
          usage_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          usage_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          usage_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      rextrix_contracts: {
        Row: {
          id: string
          company_id: string
          cfo_id: string
          monthly_fee: number
          contract_period: number
          work_hours_per_month: number | null
          start_date: string
          end_date: string | null
          status: 'draft' | 'active' | 'completed' | 'terminated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          cfo_id: string
          monthly_fee: number
          contract_period?: number
          work_hours_per_month?: number | null
          start_date: string
          end_date?: string | null
          status?: 'draft' | 'active' | 'completed' | 'terminated'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          cfo_id?: string
          monthly_fee?: number
          contract_period?: number
          work_hours_per_month?: number | null
          start_date?: string
          end_date?: string | null
          status?: 'draft' | 'active' | 'completed' | 'terminated'
          created_at?: string
          updated_at?: string
        }
      }
      rextrix_invoices: {
        Row: {
          id: string
          contract_id: string
          invoice_date: string
          due_date: string
          period_start: string
          period_end: string
          consulting_fee: number
          platform_fee_rate: number
          platform_fee: number
          total_amount: number
          status: 'pending' | 'paid' | 'verified' | 'overdue'
          paid_at: string | null
          verified_at: string | null
          payment_proof_urls: any | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          invoice_date: string
          due_date: string
          period_start: string
          period_end: string
          consulting_fee: number
          platform_fee_rate?: number
          platform_fee: number
          total_amount: number
          status?: 'pending' | 'paid' | 'verified' | 'overdue'
          paid_at?: string | null
          verified_at?: string | null
          payment_proof_urls?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          invoice_date?: string
          due_date?: string
          period_start?: string
          period_end?: string
          consulting_fee?: number
          platform_fee_rate?: number
          platform_fee?: number
          total_amount?: number
          status?: 'pending' | 'paid' | 'verified' | 'overdue'
          paid_at?: string | null
          verified_at?: string | null
          payment_proof_urls?: any | null
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
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select(`
      *,
      ${TABLES.USERS}(*)
    `)
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const getCompanyProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from(TABLES.COMPANIES)
    .select(`
      *,
      ${TABLES.USERS}(*),
      ${TABLES.USER_PROFILES}(*)
    `)
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const getCFOProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from(TABLES.CFOS)
    .select(`
      *,
      ${TABLES.USERS}(*),
      ${TABLES.USER_PROFILES}(*)
    `)
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const getSkillTags = async () => {
  const { data, error } = await supabase
    .from(TABLES.SKILL_TAGS)
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('usage_count', { ascending: false })
  
  return { data, error }
}

export const getChallengeTags = async () => {
  const { data, error } = await supabase
    .from(TABLES.CHALLENGE_TAGS)
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })
  
  return { data, error }
}