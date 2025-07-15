// Database Schema Types
export interface DatabaseUser {
  id: string
  email: string
  password_hash: string
  user_type: 'cfo' | 'company'
  display_name?: string
  avatar_url?: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

// 新アーキテクチャ準拠: cfo_profilesテーブル
export interface DatabaseCFOProfile {
  cfo_user_id: string // PRIMARY KEY, auth.users FK
  avatar_url?: string
  cfo_name?: string
  cfo_display_name?: string
  cfo_location?: string
  cfo_availability?: string
  cfo_fee_min?: number
  cfo_fee_max?: number
  cfo_skills: string[] // JSONB field
  cfo_raw_profile: string
  created_at: string
  updated_at: string
}

// 新アーキテクチャ準拠: biz_profilesテーブル
export interface DatabaseCompanyProfile {
  biz_user_id: string // PRIMARY KEY, auth.users FK
  avatar_url?: string
  biz_company_name: string
  biz_location?: string
  biz_revenue_min?: number
  biz_revenue_max?: number
  biz_issues: string[] // JSONB field
  biz_raw_profile: string
  // 企業プロフィールの詳細項目（2025-07-15追加）
  biz_description?: string
  biz_revenue_range?: string
  biz_challenge_background?: string
  created_at: string
  updated_at: string
}

// 新アーキテクチャ: conversationテーブルは不要（削除）

// 新アーキテクチャ準拠: messagesテーブル
export interface DatabaseMessage {
  msg_id: number // PRIMARY KEY (bigserial)
  sender_id: string // auth.users FK
  receiver_id: string // auth.users FK
  msg_type: 'chat' | 'scout' // ENUM
  body: string
  sent_at: string
}

// 新アーキテクチャ: scoutはmessagesテーブルのmsg_type='scout'として統合

export interface DatabaseMeeting {
  id: string
  organizer_id: string
  participant_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  meeting_type: 'video' | 'phone' | 'in_person'
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// 契約・請求書機能はベータ版では除外

// 新アーキテクチャ準拠: likesテーブル（複合主キー）
export interface DatabaseLike {
  liker_id: string  // auth.users FK, PRIMARY KEY part 1
  target_id: string // auth.users FK, PRIMARY KEY part 2
  created_at: string
}

export interface DatabaseActivity {
  id: string
  user_id: string
  activity_type: string
  target_id?: string
  description: string
  created_at: string
}

// Supabase specific types
export interface SupabaseQueryResult<T> {
  data: T[] | T | null
  error: any
  count?: number
  status: number
  statusText: string
}

// 新アーキテクチャ準拠: reviewsテーブル
export interface DatabaseReview {
  review_id: number // PRIMARY KEY (bigserial)
  reviewer_id: string // auth.users FK
  target_id: string // auth.users FK
  rating: number // 1-5 CHECK constraint
  comment?: string
  created_at: string
}

// 新アーキテクチャ準拠: attachmentsテーブル
export interface DatabaseAttachment {
  file_id: number // PRIMARY KEY (bigserial)
  file_url: string
  file_name?: string
  msg_id?: number // messages FK (nullable)
  cfo_user_id?: string // cfo_profiles FK (nullable)
  biz_user_id?: string // biz_profiles FK (nullable)
  uploaded_by: string // auth.users FK
  created_at: string
}