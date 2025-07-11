// Rextrix v3 Database Table Constants
// テーブル名の定数定義（rextrix_ プレフィックス付き）

export const TABLES = {
  // ユーザー関連
  USERS: 'rextrix_users',
  USER_PROFILES: 'rextrix_user_profiles',
  
  // 企業関連
  COMPANIES: 'rextrix_companies',
  COMPANY_CHALLENGES: 'rextrix_company_challenges',
  
  // CFO関連
  CFOS: 'rextrix_cfos',
  CFO_SKILLS: 'rextrix_cfo_skills',
  
  // タグ管理
  SKILL_TAGS: 'rextrix_skill_tags',
  CHALLENGE_TAGS: 'rextrix_challenge_tags',
  
  // マッチング・スカウト
  INTERESTS: 'rextrix_interests',
  SCOUTS: 'rextrix_scouts',
  SCOUT_RESPONSES: 'rextrix_scout_responses',
  
  // 契約・決済
  CONTRACTS: 'rextrix_contracts',
  INVOICES: 'rextrix_invoices',
  PAYMENTS: 'rextrix_payments',
  
  // メッセージング
  CONVERSATIONS: 'rextrix_conversations',
  MESSAGES: 'rextrix_messages',
  
  // 面談・スケジュール
  MEETINGS: 'rextrix_meetings',
  MEETING_PARTICIPANTS: 'rextrix_meeting_participants',
  
  // 活動履歴
  ACTIVITIES: 'rextrix_activities',
  
  // 通知
  NOTIFICATIONS: 'rextrix_notifications',
  
  // 管理者
  ADMIN_USERS: 'rextrix_admin_users',
  AUDIT_LOGS: 'rextrix_audit_logs',
} as const;

// テーブル名の型定義
export type TableName = typeof TABLES[keyof typeof TABLES];

// 使用例：
// const { data } = await supabase.from(TABLES.USERS).select('*');