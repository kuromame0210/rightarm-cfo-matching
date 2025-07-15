// API Response Types
export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 新アーキテクチャ準拠: CFOプロフィール
export interface CFOProfile {
  cfo_user_id: string
  avatar_url?: string
  cfo_name?: string
  cfo_display_name?: string
  cfo_location?: string
  cfo_availability?: string
  cfo_fee_min?: number
  cfo_fee_max?: number
  cfo_skills: string[]
  cfo_raw_profile: string
  created_at: string
  updated_at: string
}

// 新アーキテクチャ準拠: 企業プロフィール
export interface CompanyProfile {
  biz_user_id: string
  avatar_url?: string
  biz_company_name: string
  biz_location?: string
  biz_revenue_min?: number
  biz_revenue_max?: number
  biz_issues: string[]
  biz_raw_profile: string
  created_at: string
  updated_at: string
}

// 新アーキテクチャ準拠: スカウト（messagesテーブルのmsg_type='scout'）
export interface ScoutData {
  msg_id: number
  sender_id: string
  receiver_id: string
  msg_type: 'scout'
  body: string
  sent_at: string
}

// Meeting Types
export interface Meeting {
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
}

// 新アーキテクチャ: Conversationテーブルは不要（削除）

// 新アーキテクチャ準拠: メッセージ
export interface Message {
  msg_id: number
  sender_id: string
  receiver_id: string
  msg_type: 'chat' | 'scout'
  body: string
  sent_at: string
}

// 契約・請求書機能はベータ版では除外

// 新アーキテクチャ準拠: レビュー
export interface Review {
  review_id: number
  reviewer_id: string
  target_id: string
  rating: number // 1-5
  comment?: string
  created_at: string
}

// 新アーキテクチャ準拠: 添付ファイル
export interface Attachment {
  file_id: number
  file_url: string
  file_name?: string
  msg_id?: number
  cfo_user_id?: string
  biz_user_id?: string
  uploaded_by: string
  created_at: string
}

// 設計書準拠: Likesテーブルの型定義
export interface Like {
  likerId: string      // liker_id
  targetId: string     // target_id
  targetName: string   // 表示用: 相手の名前
  targetType: 'cfo' | 'company'  // 表示用: 相手のタイプ
  targetAvatar: string // 表示用: 相手のアバター
  createdAt: string
  meta: {
    architecture: string
    table: string
  }
}

// Search and Filter Types
export interface SearchFilters {
  searchQuery: string
  selectedSkills: string[]
  selectedRegion: string
  selectedWorkStyle: string
  selectedCompensation: string
  sortBy: string
}

// Common Types
export type UserType = 'cfo' | 'company'
export type ProfileType = CFOProfile | CompanyProfile