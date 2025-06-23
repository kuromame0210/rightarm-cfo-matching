import { Tag, CfoWithProfile, CompanyWithProfile, Application, Message, Conversation, Meeting, Contract, Invoice, Review, User } from '@/types'

// Mock Tags
export const mockTags: Tag[] = [
  // Skill tags
  { id: '1', name: '資金調達', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '2', name: '銀行融資対応', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '3', name: 'IPO準備支援', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '4', name: 'M&Aアドバイザリー', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '5', name: '管理会計構築', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '6', name: 'クラウド会計導入', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '7', name: 'フルリモート可', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '8', name: '週1日対応可', type: 'skill', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  
  // Challenge tags
  { id: '9', name: 'IPO準備', type: 'challenge', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '10', name: '資金調達', type: 'challenge', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '11', name: '管理会計導入', type: 'challenge', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '12', name: '財務DX', type: 'challenge', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '13', name: 'M&A売却', type: 'challenge', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: '14', name: '事業再生', type: 'challenge', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
]

// Mock Users
export const mockUsers: User[] = [
  { id: 'user-cfo-1', email: 'tanaka@example.com', userType: 'cfo', emailVerified: true, status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'user-cfo-2', email: 'suzuki@example.com', userType: 'cfo', emailVerified: true, status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'user-cfo-3', email: 'watanabe@example.com', userType: 'cfo', emailVerified: true, status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'user-company-1', email: 'info@techcorp.jp', userType: 'company', emailVerified: true, status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'user-company-2', email: 'contact@startupx.jp', userType: 'company', emailVerified: true, status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'user-company-3', email: 'hr@innovation.jp', userType: 'company', emailVerified: true, status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
]

// Mock CFO Profiles
export const mockCfoProfiles: CfoWithProfile[] = [
  {
    id: 'cfo-1',
    userId: 'user-cfo-1',
    firstName: '太郎',
    lastName: '田中',
    displayName: '田中太郎',
    bio: '大手監査法人で10年、ベンチャー企業CFOとして8年の経験。IPO準備から資金調達まで幅広く対応可能です。',
    locationPrefecture: '東京都',
    locationCity: '渋谷区',
    yearsExperience: 18,
    hourlyRateMin: 8000,
    hourlyRateMax: 15000,
    ratingAverage: 4.8,
    ratingCount: 12,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: mockUsers[0],
    tags: [mockTags[0], mockTags[2], mockTags[4], mockTags[7]]
  },
  {
    id: 'cfo-2',
    userId: 'user-cfo-2',
    firstName: '花子',
    lastName: '鈴木',
    displayName: '鈴木花子',
    bio: 'M&A専門のアドバイザリー経験15年。買収・売却どちらも対応可能で、PMI支援も得意です。',
    locationPrefecture: '東京都',
    locationCity: '港区',
    yearsExperience: 15,
    hourlyRateMin: 10000,
    hourlyRateMax: 20000,
    ratingAverage: 4.6,
    ratingCount: 8,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: mockUsers[1],
    tags: [mockTags[3], mockTags[0], mockTags[6]]
  },
  {
    id: 'cfo-3',
    userId: 'user-cfo-3',
    firstName: '次郎',
    lastName: '渡辺',
    displayName: '渡辺次郎',
    bio: 'IT系スタートアップ専門のCFO。クラウド会計の導入から管理会計の構築まで、DXを推進します。',
    locationPrefecture: '神奈川県',
    locationCity: '横浜市',
    yearsExperience: 12,
    hourlyRateMin: 6000,
    hourlyRateMax: 12000,
    ratingAverage: 4.9,
    ratingCount: 15,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: mockUsers[2],
    tags: [mockTags[4], mockTags[5], mockTags[6], mockTags[7]]
  }
]

// Mock Company Profiles
export const mockCompanyProfiles: CompanyWithProfile[] = [
  {
    id: 'company-1',
    userId: 'user-company-1',
    companyName: '株式会社テクノコープ',
    companyDescription: 'AIを活用したSaaS事業を展開。次期IPOに向けて内部統制の強化と資金調達を計画中。',
    industry: 'IT・ソフトウェア',
    companySize: '51-100名',
    revenueRange: '10-30億円',
    locationPrefecture: '東京都',
    locationCity: '新宿区',
    websiteUrl: 'https://techcorp.example.jp',
    establishedYear: 2018,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: mockUsers[3],
    tags: [mockTags[8], mockTags[9], mockTags[10]]
  },
  {
    id: 'company-2',
    userId: 'user-company-2',
    companyName: 'スタートアップX',
    companyDescription: 'フィンテック領域で革新的なサービスを提供。シリーズBラウンドの資金調達を準備中。',
    industry: 'フィンテック',
    companySize: '11-50名',
    revenueRange: '1-10億円',
    locationPrefecture: '東京都',
    locationCity: '渋谷区',
    websiteUrl: 'https://startupx.example.jp',
    establishedYear: 2020,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: mockUsers[4],
    tags: [mockTags[9], mockTags[11]]
  },
  {
    id: 'company-3',
    userId: 'user-company-3',
    companyName: '株式会社イノベーション',
    companyDescription: '製造業向けDXソリューションを提供。事業拡大に伴い財務体制の強化が急務。',
    industry: '製造業',
    companySize: '101-500名',
    revenueRange: '30-100億円',
    locationPrefecture: '大阪府',
    locationCity: '大阪市',
    websiteUrl: 'https://innovation.example.jp',
    establishedYear: 2015,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: mockUsers[5],
    tags: [mockTags[11], mockTags[12]]
  }
]

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: 'app-1',
    companyId: 'company-1',
    cfoId: 'cfo-1',
    applicationType: 'scout_company',
    status: 'pending',
    coverMessage: 'IPO準備のため、経験豊富なCFOをお迎えしたく、ご相談させていただきたいです。',
    createdAt: '2025-06-20T10:00:00Z',
    updatedAt: '2025-06-20T10:00:00Z'
  },
  {
    id: 'app-2',
    companyId: 'company-2',
    cfoId: 'cfo-2',
    applicationType: 'scout_cfo',
    status: 'accepted',
    coverMessage: 'M&Aの経験を活かして、弊社の成長戦略にご参画いただけませんでしょうか。',
    createdAt: '2025-06-19T14:30:00Z',
    updatedAt: '2025-06-19T15:00:00Z'
  }
]

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participant1Id: 'user-company-1',
    participant2Id: 'user-cfo-1',
    stage: 'negotiation',
    lastMessageAt: '2025-06-22T09:30:00Z',
    createdAt: '2025-06-20T10:30:00Z'
  },
  {
    id: 'conv-2',
    participant1Id: 'user-company-2',
    participant2Id: 'user-cfo-2',
    stage: 'meeting',
    lastMessageAt: '2025-06-21T16:45:00Z',
    createdAt: '2025-06-19T15:00:00Z'
  }
]

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-company-1',
    content: 'はじめまして。IPO準備に向けて、CFOとしてご支援いただけますでしょうか。',
    messageType: 'text',
    createdAt: '2025-06-20T10:30:00Z'
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-cfo-1',
    content: 'ご連絡ありがとうございます。詳細をお聞かせください。まずは面談させていただければと思います。',
    messageType: 'text',
    readAt: '2025-06-20T11:00:00Z',
    createdAt: '2025-06-20T10:45:00Z'
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-company-1',
    content: '承知いたしました。来週の面談はいかがでしょうか。',
    messageType: 'text',
    createdAt: '2025-06-22T09:30:00Z'
  }
]

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: 'meeting-1',
    organizerId: 'user-company-1',
    participantId: 'user-cfo-1',
    scheduledAt: '2025-06-25T14:00:00Z',
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/abc-def-ghi',
    status: 'scheduled',
    createdAt: '2025-06-22T10:00:00Z'
  },
  {
    id: 'meeting-2',
    organizerId: 'user-cfo-2',
    participantId: 'user-company-2',
    scheduledAt: '2025-06-24T10:00:00Z',
    durationMinutes: 90,
    meetingUrl: 'https://zoom.us/j/123456789',
    status: 'completed',
    createdAt: '2025-06-21T16:00:00Z'
  }
]

// Mock Contracts
export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    applicationId: 'app-2',
    companyId: 'company-2',
    cfoId: 'cfo-2',
    amount: 1000000,
    feePercentage: 5.0,
    feeAmount: 50000,
    status: 'active',
    startedAt: '2025-06-22T00:00:00Z',
    createdAt: '2025-06-21T18:00:00Z'
  }
]

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    contractId: 'contract-1',
    companyId: 'company-2',
    cfoId: 'cfo-2',
    amount: 1000000,
    feePercentage: 5.0,
    feeAmount: 50000,
    totalAmount: 1050000,
    status: 'pending',
    createdAt: '2025-06-22T10:00:00Z'
  }
]

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'review-1',
    contractId: 'contract-1',
    reviewerId: 'user-company-2',
    revieweeId: 'user-cfo-2',
    rating: 5,
    title: '期待以上の成果',
    content: 'M&Aプロセスを非常にスムーズに進めていただき、期待以上の成果を得ることができました。',
    createdAt: '2025-06-20T15:00:00Z'
  }
]

// Helper functions
export const getCfoById = (id: string) => mockCfoProfiles.find(cfo => cfo.id === id)
export const getCompanyById = (id: string) => mockCompanyProfiles.find(company => company.id === id)
export const getTagsByIds = (ids: string[]) => mockTags.filter(tag => ids.includes(tag.id))
export const getApplicationsByUserId = (userId: string) => mockApplications.filter(app => 
  mockCfoProfiles.find(cfo => cfo.userId === userId && cfo.id === app.cfoId) ||
  mockCompanyProfiles.find(company => company.userId === userId && company.id === app.companyId)
)
export const getConversationsByUserId = (userId: string) => mockConversations.filter(conv => 
  conv.participant1Id === userId || conv.participant2Id === userId
)
export const getMessagesByConversationId = (conversationId: string) => 
  mockMessages.filter(msg => msg.conversationId === conversationId)