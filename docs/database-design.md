# RightArm CFOマッチングプラットフォーム データベース設計

## 概要
CFOと企業をマッチングするプラットフォームのデータベース設計書です。
ユーザー管理、プロフィール管理、マッチング、メッセージング、決済などの機能をサポートします。

## テーブル一覧

### 1. ユーザー関連

#### users (ユーザー基本情報)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('company', 'cfo') NOT NULL,
    status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    profile_image_type ENUM('upload', 'icon') DEFAULT 'icon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- 索引
    INDEX idx_users_email (email),
    INDEX idx_users_type_status (user_type, status),
    INDEX idx_users_created_at (created_at)
);
```

#### user_profiles (ユーザープロフィール詳細)
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    introduction TEXT,
    phone_number VARCHAR(20),
    region VARCHAR(50),
    
    -- 共通フィールド
    work_preference TEXT, -- 稼働希望形態
    compensation_range VARCHAR(50), -- 希望報酬範囲
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_region (region)
);
```

### 2. 企業関連

#### companies (企業情報)
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    description TEXT,
    industry VARCHAR(100),
    region VARCHAR(50),
    employee_count VARCHAR(50),
    revenue_range ENUM('under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private'),
    website_url TEXT,
    established_year INTEGER,
    
    -- 募集情報
    is_recruiting BOOLEAN DEFAULT TRUE,
    recruitment_urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    expected_timeline VARCHAR(100),
    work_style VARCHAR(100),
    compensation_offer VARCHAR(100),
    
    -- 課題・要求情報
    challenge_background TEXT,
    cfo_requirements TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_companies_user_id (user_id),
    INDEX idx_companies_industry_region (industry, region),
    INDEX idx_companies_recruiting (is_recruiting),
    INDEX idx_companies_urgency (recruitment_urgency)
);
```

#### company_challenges (企業の財務課題タグ)
```sql
CREATE TABLE company_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    challenge_tag_id UUID NOT NULL REFERENCES challenge_tags(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(company_id, challenge_tag_id),
    
    -- 索引
    INDEX idx_company_challenges_company (company_id),
    INDEX idx_company_challenges_tag (challenge_tag_id)
);
```

### 3. CFO関連

#### cfos (CFO詳細情報)
```sql
CREATE TABLE cfos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experience_years INTEGER,
    experience_summary TEXT,
    achievements TEXT, -- JSON配列として格納
    
    -- 対応可能性
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_projects INTEGER DEFAULT 3,
    
    -- 評価情報
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_cfos_user_id (user_id),
    INDEX idx_cfos_available (is_available),
    INDEX idx_cfos_rating (rating DESC)
);
```

#### cfo_skills (CFOのスキル)
```sql
CREATE TABLE cfo_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES cfos(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES skill_tags(id),
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(cfo_id, skill_tag_id),
    
    -- 索引
    INDEX idx_cfo_skills_cfo (cfo_id),
    INDEX idx_cfo_skills_tag (skill_tag_id)
);
```

#### cfo_certifications (CFOの資格)
```sql
CREATE TABLE cfo_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES cfos(id) ON DELETE CASCADE,
    certification_name VARCHAR(100) NOT NULL,
    issuing_organization VARCHAR(100),
    obtained_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_cfo_certifications_cfo (cfo_id)
);
```

### 4. タグ管理

#### skill_tags (スキルタグ大分類)
```sql
CREATE TABLE skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('資金調達', 'IPO・M&A関連', '財務DX・システム導入', '事業承継・再生', '組織・ガバナンス', 'その他') NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_skill_tags_category (category),
    INDEX idx_skill_tags_usage (usage_count DESC),
    INDEX idx_skill_tags_active (is_active)
);
```

#### challenge_tags (財務課題タグ)
```sql
CREATE TABLE challenge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_challenge_tags_usage (usage_count DESC),
    INDEX idx_challenge_tags_active (is_active)
);
```

### 5. マッチング関連

#### interests (気になる)
```sql
CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type ENUM('company', 'cfo') NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約（同じユーザーが同じ対象に複数回気になるを付けられない）
    UNIQUE(user_id, target_user_id),
    
    -- 索引
    INDEX idx_interests_user (user_id),
    INDEX idx_interests_target (target_user_id, target_type),
    INDEX idx_interests_created (created_at DESC)
);
```

#### scouts (スカウト)
```sql
CREATE TABLE scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('sent', 'read', 'replied', 'accepted', 'declined') DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    
    -- 索引
    INDEX idx_scouts_sender (sender_id),
    INDEX idx_scouts_recipient (recipient_id),
    INDEX idx_scouts_status (status),
    INDEX idx_scouts_sent_at (sent_at DESC)
);
```

#### matches (マッチング成立)
```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cfo_id UUID NOT NULL REFERENCES cfos(id) ON DELETE CASCADE,
    scout_id UUID REFERENCES scouts(id), -- スカウト経由の場合
    status ENUM('matched', 'in_negotiation', 'contracted', 'completed', 'cancelled') DEFAULT 'matched',
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contract_start_date DATE,
    contract_end_date DATE,
    
    -- 複合ユニーク制約
    UNIQUE(company_id, cfo_id),
    
    -- 索引
    INDEX idx_matches_company (company_id),
    INDEX idx_matches_cfo (cfo_id),
    INDEX idx_matches_status (status),
    INDEX idx_matches_matched_at (matched_at DESC)
);
```

### 6. メッセージング

#### conversations (会話スレッド)
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_conversations_match (match_id),
    INDEX idx_conversations_participants (participant1_id, participant2_id),
    INDEX idx_conversations_last_message (last_message_at DESC)
);
```

#### messages (メッセージ)
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type ENUM('text', 'file', 'system') DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- 索引
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_sent_at (sent_at DESC)
);
```

### 7. 面談・スケジュール

#### meetings (面談予定)
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meeting_type ENUM('initial', 'follow_up', 'contract_discussion', 'other') DEFAULT 'initial',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT, -- Zoom, Google Meet等のURL
    location VARCHAR(200), -- 対面の場合の場所
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    
    -- 参加者情報
    company_user_id UUID NOT NULL REFERENCES users(id),
    cfo_user_id UUID NOT NULL REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_meetings_match (match_id),
    INDEX idx_meetings_scheduled (scheduled_at),
    INDEX idx_meetings_status (status),
    INDEX idx_meetings_participants (company_user_id, cfo_user_id)
);
```

### 8. レビュー・評価

#### reviews (レビュー)
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約（同じマッチで同じレビュアーは1回のみ）
    UNIQUE(match_id, reviewer_id),
    
    -- 索引
    INDEX idx_reviews_match (match_id),
    INDEX idx_reviews_reviewee (reviewee_id),
    INDEX idx_reviews_rating (rating DESC),
    INDEX idx_reviews_created (created_at DESC)
);
```

### 9. 通知システム

#### notifications (通知)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type ENUM('scout_received', 'scout_replied', 'match_created', 'message_received', 'meeting_scheduled', 'review_received', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id UUID, -- 関連するリソースのID（scout_id, match_id等）
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- 索引
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_unread (user_id, is_read),
    INDEX idx_notifications_created (created_at DESC)
);
```

### 10. システム管理

#### admin_users (管理者ユーザー)
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON, -- 詳細権限設定
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_admin_users_email (email),
    INDEX idx_admin_users_role (role)
);
```

#### audit_logs (監査ログ)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    admin_user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSON,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_admin (admin_user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created (created_at DESC)
);
```

### 11. 決済・請求（将来拡張用）

#### subscriptions (サブスクリプション)
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
    status ENUM('active', 'cancelled', 'expired', 'past_due') DEFAULT 'active',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_period_end (current_period_end)
);
```

#### payments (決済履歴)
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    amount INTEGER NOT NULL, -- センチ単位
    currency VARCHAR(3) DEFAULT 'JPY',
    status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_subscription (subscription_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created (created_at DESC)
);
```

## 初期データ投入

### スキルタグ初期データ
```sql
INSERT INTO skill_tags (name, category) VALUES
-- 資金調達
('VC調達', '資金調達'),
('銀行融資', '資金調達'),
('補助金申請', '資金調達'),
('投資家対応', '資金調達'),
('クラウドファンディング', '資金調達'),
('社債発行', '資金調達'),

-- IPO・M&A関連
('IPO準備', 'IPO・M&A関連'),
('M&A戦略', 'IPO・M&A関連'),
('企業価値評価', 'IPO・M&A関連'),
('DD対応', 'IPO・M&A関連'),
('IR活動', 'IPO・M&A関連'),
('上場審査対応', 'IPO・M&A関連'),

-- 財務DX・システム導入
('ERP導入', '財務DX・システム導入'),
('管理会計システム', '財務DX・システム導入'),
('BI導入', '財務DX・システム導入'),
('API連携', '財務DX・システム導入'),
('RPA導入', '財務DX・システム導入'),
('SaaS選定', '財務DX・システム導入'),

-- 事業承継・再生
('事業承継計画', '事業承継・再生'),
('事業再生', '事業承継・再生'),
('リストラクチャリング', '事業承継・再生'),
('組織再編', '事業承継・再生'),
('後継者育成', '事業承継・再生'),
('株価算定', '事業承継・再生'),

-- 組織・ガバナンス
('内部統制', '組織・ガバナンス'),
('コンプライアンス', '組織・ガバナンス'),
('リスク管理', '組織・ガバナンス'),
('KPI設計', '組織・ガバナンス'),
('予算管理', '組織・ガバナンス'),
('取締役会運営', '組織・ガバナンス'),

-- その他
('国際税務', 'その他'),
('連結決算', 'その他'),
('IFRS', 'その他'),
('原価計算', 'その他'),
('管理会計', 'その他'),
('財務分析', 'その他');
```

### 財務課題タグ初期データ
```sql
INSERT INTO challenge_tags (name) VALUES
('資金調達'),
('IPO準備'),
('財務DX・システム導入'),
('事業承継・再生'),
('組織・ガバナンス'),
('M&A関連'),
('管理会計強化'),
('補助金活用'),
('銀行融資'),
('投資家対応'),
('原価計算'),
('予実管理'),
('その他');
```

## パフォーマンス最適化

### インデックス戦略
1. **複合インデックス**: よく使われる検索条件の組み合わせ
2. **部分インデックス**: 特定条件のレコードのみ
3. **カバリングインデックス**: SELECT で必要な全列を含む

### パーティショニング戦略
- `audit_logs`: 日付ベースのパーティショニング
- `messages`: 日付ベースのパーティショニング
- `notifications`: 日付ベースのパーティショニング

## セキュリティ考慮事項

1. **個人情報保護**: 機密情報の暗号化
2. **アクセス制御**: Row Level Security (RLS) の活用
3. **監査**: 全ての重要操作のログ記録
4. **データマスキング**: 開発環境での個人情報匿名化

## 拡張性考慮事項

1. **水平スケーリング**: 読み取り専用レプリカの活用
2. **キャッシュ戦略**: Redis を使った頻繁アクセスデータの高速化
3. **APIレート制限**: ユーザー単位の制限管理
4. **ファイル管理**: S3 等のオブジェクトストレージとの連携

この設計により、CFOマッチングプラットフォームの全機能を効率的にサポートできます。