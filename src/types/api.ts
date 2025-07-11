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

// Profile Types
export interface CFOProfile {
  id: string
  user_id: string
  display_name: string
  experience_years: number
  specialties: string[]
  is_available: boolean
  hourly_rate?: number
  region?: string
  bio?: string
  avatar_url?: string
  achievements?: string[]
  education?: string
  certifications?: string[]
  languages?: string[]
  work_style?: 'remote' | 'onsite' | 'hybrid'
  compensation_type?: 'hourly' | 'project' | 'monthly'
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  business_name?: string
  industry: string
  employee_count: number
  description: string
  challenges: string[]
  website?: string
  logo_url?: string
  budget_range?: string
  project_timeline?: string
  required_skills?: string[]
  work_location?: string
  company_stage?: 'startup' | 'growing' | 'established'
}

// Scout Types
export interface ScoutData {
  id: string
  sender_id: string
  recipient_id: string
  recipient_type: 'cfo' | 'company'
  message: string
  status: 'pending' | 'accepted' | 'declined'
  sent_at: string
  responded_at?: string
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

// Message Types
export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  created_at: string
  otherUserName?: string
  otherUserType?: 'cfo' | 'company'
  otherProfileId?: string
  otherUserId?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  sent_at: string
  is_read: boolean
}

// Contract Types
export interface Contract {
  id: string
  cfo_id: string
  company_id: string
  title: string
  description: string
  compensation: number
  compensation_type: 'hourly' | 'project' | 'monthly'
  start_date: string
  end_date?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  terms: string
  created_at: string
  updated_at: string
}

// Invoice Types
export interface Invoice {
  id: string
  contract_id: string
  amount: number
  description: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issued_at: string
  paid_at?: string
}

// Interest Types
export interface Interest {
  id: string
  user_id: string
  target_id: string
  target_type: 'cfo' | 'company'
  created_at: string
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