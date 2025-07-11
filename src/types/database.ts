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

export interface DatabaseCFOProfile {
  id: string
  user_id: string
  display_name: string
  bio?: string
  experience_years: number
  hourly_rate?: number
  is_available: boolean
  region?: string
  work_style?: 'remote' | 'onsite' | 'hybrid'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface DatabaseCompanyProfile {
  id: string
  user_id: string
  company_name: string
  business_name?: string
  industry: string
  employee_count: number
  description: string
  website?: string
  logo_url?: string
  budget_range?: string
  work_location?: string
  company_stage?: 'startup' | 'growing' | 'established'
  created_at: string
  updated_at: string
}

export interface DatabaseConversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface DatabaseMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  sent_at: string
  is_read: boolean
  created_at: string
}

export interface DatabaseScout {
  id: string
  sender_id: string
  recipient_id: string
  recipient_type: 'cfo' | 'company'
  message: string
  status: 'pending' | 'accepted' | 'declined'
  sent_at: string
  responded_at?: string
  created_at: string
  updated_at: string
}

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

export interface DatabaseContract {
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

export interface DatabaseInvoice {
  id: string
  contract_id: string
  amount: number
  description: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issued_at: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface DatabaseInterest {
  id: string
  user_id: string
  target_id: string
  target_type: 'cfo' | 'company'
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

// Skill and Service Types
export interface DatabaseCFOSkill {
  id: string
  cfo_profile_id: string
  skill_name: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  created_at: string
}

export interface DatabaseCFOService {
  id: string
  cfo_profile_id: string
  service_name: string
  description?: string
  price?: number
  created_at: string
}

export interface DatabaseCFOCertification {
  id: string
  cfo_profile_id: string
  certification_name: string
  issuing_organization: string
  issue_date: string
  expiry_date?: string
  created_at: string
}

export interface DatabaseCFOWorkHistory {
  id: string
  cfo_profile_id: string
  company_name: string
  position: string
  start_date: string
  end_date?: string
  description?: string
  created_at: string
}