// User types
export type UserType = 'company' | 'cfo'

export interface User {
  id: string
  email: string
  userType: UserType
  emailVerified: boolean
  status: string
  createdAt: string
  updatedAt: string
}

// Profile types
export interface CompanyProfile {
  id: string
  userId: string
  companyName: string
  companyDescription?: string
  industry?: string
  companySize?: string
  revenueRange?: string
  locationPrefecture?: string
  locationCity?: string
  websiteUrl?: string
  establishedYear?: number
  createdAt: string
  updatedAt: string
}

export interface CfoProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName?: string
  bio?: string
  locationPrefecture?: string
  locationCity?: string
  yearsExperience?: number
  hourlyRateMin?: number
  hourlyRateMax?: number
  ratingAverage: number
  ratingCount: number
  createdAt: string
  updatedAt: string
}

// Tag types
export type TagType = 'skill' | 'challenge'

export interface Tag {
  id: string
  name: string
  type: TagType
  isActive: boolean
  createdAt: string
}

// Application types
export type ApplicationType = 'application' | 'scout_company' | 'scout_cfo'
export type ApplicationStatus = 'pending' | 'accepted' | 'interviewed' | 'rejected' | 'withdrawn'

export interface Application {
  id: string
  projectId?: string
  companyId: string
  cfoId: string
  applicationType: ApplicationType
  status: ApplicationStatus
  coverMessage?: string
  createdAt: string
  updatedAt: string
}

// Conversation types
export type ConversationStage = 'inquiry' | 'shortlist' | 'negotiation' | 'meeting' | 'contracted'

export interface Conversation {
  id: string
  participant1Id: string
  participant2Id: string
  stage: ConversationStage
  lastMessageAt?: string
  createdAt: string
}

// Message types
export type MessageType = 'text' | 'file' | 'image' | 'meeting_invite'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content?: string
  messageType: MessageType
  readAt?: string
  createdAt: string
}

// Meeting types
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Meeting {
  id: string
  organizerId: string
  participantId: string
  scheduledAt: string
  durationMinutes: number
  meetingUrl?: string
  status: MeetingStatus
  createdAt: string
}

// Contract types
export type ContractStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export interface Contract {
  id: string
  applicationId: string
  companyId: string
  cfoId: string
  amount: number
  feePercentage: number
  feeAmount: number
  status: ContractStatus
  startedAt?: string
  endedAt?: string
  createdAt: string
}

// Invoice types
export type InvoiceStatus = 'pending' | 'paid' | 'verified'

export interface Invoice {
  id: string
  contractId: string
  companyId?: string
  cfoId?: string
  amount: number
  feePercentage: number
  feeAmount: number
  totalAmount: number
  evidenceUrl?: string
  status: InvoiceStatus
  paidAt?: string
  verifiedAt?: string
  createdAt: string
}

// Review types
export interface Review {
  id: string
  contractId: string
  reviewerId: string
  revieweeId: string
  rating: number
  title?: string
  content?: string
  createdAt: string
}

// Combined types for UI
export interface CfoWithProfile extends CfoProfile {
  user: User
  tags: Tag[]
}

export interface CompanyWithProfile extends CompanyProfile {
  user: User
  tags: Tag[]
}

// Filter types
export interface SearchFilters {
  keyword?: string
  tags?: string[]
  locationPrefecture?: string
  hourlyRateMin?: number
  hourlyRateMax?: number
  yearsExperience?: number
  sortBy?: 'rating' | 'experience' | 'rate' | 'recent'
}