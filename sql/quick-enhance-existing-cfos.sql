-- 既存CFOデータの即座の詳細化
-- 現在の3名のCFOプロフィールをCFO.mdレベルに拡張

-- Phase 1: 必要なJSONBカラムを追加
ALTER TABLE rextrix_cfos 
ADD COLUMN IF NOT EXISTS work_experiences JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detailed_certifications JSONB DEFAULT '[]', 
ADD COLUMN IF NOT EXISTS availability_conditions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compensation_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS consultation_approach TEXT;

-- Phase 2: 菅原大源さんのプロフィールを詳細化
UPDATE rextrix_cfos SET 
    work_experiences = '[
        {
            "company_name": "住友商事株式会社",
            "position": "アルミ業界海外新規事業投資担当",
            "start_year": 2017,
            "end_year": 2023,
            "description": "アルミ業界における海外新規事業投資業務",
            "industry": "総合商社",
            "experience_years": 6,
            "is_current": false,
            "display_order": 1
        },
        {
            "company_name": "KPMG FAS",
            "position": "M&Aアドバイザー",
            "start_year": 2023,
            "end_year": 2024,
            "description": "M&Aアドバイザリー業務",
            "industry": "コンサルティング",
            "experience_years": 1,
            "is_current": false,
            "display_order": 2
        },
        {
            "company_name": "Air Water America",
            "position": "経営管理・経営支援・新規事業投資担当",
            "start_year": 2025,
            "end_year": null,
            "description": "海外事業会社の経営管理・経営支援業務、新規事業投資業務",
            "industry": "製造業（海外子会社）",
            "location": "アメリカ・カリフォルニア州",
            "is_current": true,
            "display_order": 3
        }
    ]'::jsonb,
    
    detailed_certifications = '[
        {
            "name": "米国公認会計士",
            "organization": "AICPA",
            "is_active": true,
            "level": "CPA",
            "display_order": 1
        },
        {
            "name": "簿記2級",
            "organization": "日本商工会議所",
            "is_active": true,
            "display_order": 2
        },
        {
            "name": "FP2級",
            "organization": "日本FP協会",
            "is_active": true,
            "display_order": 3
        }
    ]'::jsonb,
    
    availability_conditions = '{
        "days_per_week": 4,
        "hours_per_day": 1,
        "total_hours_per_month": 16,
        "schedule_note": "週4日 4時間程度",
        "timezone": "アメリカ・カリフォルニア州"
    }'::jsonb,
    
    compensation_details = '{
        "primary_type": "monthly",
        "monthly_rate": {"min": 150000},
        "hourly_equivalent": 9375,
        "calculation_basis": "月15万円〜、週4日 1時間/日 16時間/月",
        "currency": "JPY"
    }'::jsonb,
    
    service_areas = '[
        {
            "type": "remote",
            "description": "全国リモートOK",
            "coverage": "全国",
            "timezone": "アメリカ・カリフォルニア州",
            "is_primary": true
        }
    ]'::jsonb,
    
    consultation_approach = '戦略と財務両輪の視点で事業成長を支援させて頂きます。',
    
    specialties = '["事業計画作成", "財務モデル作成", "資金調達戦略", "M&A支援", "経営管理"]'::jsonb

WHERE display_name = '菅原大源';

-- Phase 3: nanalystsさんのプロフィールを詳細化
UPDATE rextrix_cfos SET 
    work_experiences = '[
        {
            "company_name": "大手金融機関",
            "position": "海外駐在・融資業務担当",
            "start_year": 2004,
            "end_year": 2012,
            "description": "海外駐在にて海外進出業務・現地通貨建て融資業務",
            "industry": "銀行・金融",
            "experience_years": 8,
            "location": "海外（複数拠点）",
            "is_current": false,
            "display_order": 1
        },
        {
            "company_name": "大手金融機関",
            "position": "ベンチャーキャピタル業務担当",
            "start_year": 2012,
            "end_year": 2018,
            "description": "ベンチャーキャピタル業務・スタートアップ投資",
            "industry": "金融・VC",
            "experience_years": 6,
            "achievements": ["50社以上のスタートアップへ投資", "ハンズオン支援実績"],
            "is_current": false,
            "display_order": 2
        },
        {
            "company_name": "大手金融機関",
            "position": "法人営業",
            "start_year": 2018,
            "end_year": null,
            "description": "法人営業業務",
            "industry": "銀行・金融",
            "experience_years": 7,
            "is_current": true,
            "display_order": 3
        }
    ]'::jsonb,
    
    detailed_certifications = '[
        {
            "name": "証券アナリスト",
            "organization": "日本証券アナリスト協会",
            "is_active": true,
            "display_order": 1
        },
        {
            "name": "FP2級",
            "organization": "日本FP協会",
            "is_active": true,
            "display_order": 2
        }
    ]'::jsonb,
    
    availability_conditions = '{
        "days_per_week": 2,
        "hours_per_day": 2.5,
        "total_hours_per_week": 5,
        "schedule_note": "週2日・5時間程度",
        "flexible_schedule": true
    }'::jsonb,
    
    compensation_details = '{
        "primary_type": "monthly",
        "monthly_rate": {"min": 50000},
        "project_based": true,
        "currency": "JPY"
    }'::jsonb,
    
    service_areas = '[
        {
            "type": "remote",
            "description": "リモートにて全国",
            "coverage": "全国",
            "is_primary": true
        }
    ]'::jsonb,
    
    consultation_approach = '50社以上のスタートアップへ投資を行いハンズオンをして参りましたので、ステージに合わせた企業価値向上支援が可能です',
    
    specialties = '["資金調達支援（デット、エクイティー）", "ピッチブック作成・添削", "海外進出支援", "VC業務", "スタートアップ投資"]'::jsonb

WHERE display_name = 'nanalysts';

-- Phase 4: 田中（仮名）さんのプロフィールを詳細化
UPDATE rextrix_cfos SET 
    work_experiences = '[
        {
            "company_name": "大手総合商社",
            "position": "財務部",
            "start_year": 2016,
            "end_year": 2019,
            "description": "予実管理／経営レポート／本社経理連携",
            "industry": "総合商社",
            "experience_years": 3,
            "is_current": false,
            "display_order": 1
        },
        {
            "company_name": "Big4系コンサルティング",
            "position": "財務業務改革コンサルタント",
            "start_year": 2019,
            "end_year": 2023,
            "description": "上場・非上場企業向けの財務業務改革、決算早期化・グループ連結対応・管理会計導入支援",
            "industry": "コンサルティング",
            "experience_years": 4,
            "achievements": ["決算早期化", "管理会計導入支援", "グループ連結対応"],
            "is_current": false,
            "display_order": 2
        }
    ]'::jsonb,
    
    detailed_certifications = '[
        {
            "name": "MBA",
            "organization": "北米大学院",
            "obtained_year": 2023,
            "level": "修士",
            "location": "北米",
            "is_active": true,
            "display_order": 1
        },
        {
            "name": "日商簿記2級",
            "organization": "日本商工会議所",
            "is_active": true,
            "display_order": 2
        }
    ]'::jsonb,
    
    availability_conditions = '{
        "hours_per_week": {"min": 5, "max": 10},
        "schedule_note": "週5〜10時間程度（柔軟に調整可能）",
        "timezone": "日本時間対応可",
        "location": "北米在住／フルリモート",
        "flexible_schedule": true
    }'::jsonb,
    
    compensation_details = '{
        "primary_type": "hourly",
        "hourly_rate": {"min": 4000, "max": 10000},
        "notes": "時給4,000〜10,000円（内容・条件により応相談）",
        "success_fee_available": true,
        "monthly_contract_available": true,
        "currency": "JPY"
    }'::jsonb,
    
    service_areas = '[
        {
            "type": "remote",
            "description": "北米在住／日本時間対応可（フルリモート）",
            "coverage": "全国・グローバル",
            "timezone_support": "日本時間",
            "is_primary": true
        }
    ]'::jsonb,
    
    consultation_approach = '北米進出中の日本企業数社にて、リモートCFO的立場での支援実績あり。日本時間での対応・コミュニケーションに支障なし。経営者・現場間の"翻訳"と意思決定支援が得意です。',
    
    specialties = '["経営陣向け報告資料の作成", "ストーリーテリング", "資金繰り管理", "資金調達（金融機関対応含む）", "予実管理の仕組み化", "KPI設計", "決算早期化", "経理業務の可視化・効率化", "管理会計導入支援", "M&A時の財務DD", "PMI初期フェーズ支援"]'::jsonb

WHERE display_name = '田中（仮名）';

-- Phase 5: rextrix_user_profilesにも詳細情報を追加
ALTER TABLE rextrix_user_profiles 
ADD COLUMN IF NOT EXISTS location_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}';

-- 既存CFOユーザーの地域詳細情報を更新
UPDATE rextrix_user_profiles SET 
    location_details = jsonb_build_object(
        'region', '関西',
        'remote_work_available', true,
        'international_available', false
    ),
    contact_preferences = jsonb_build_object(
        'preferred_method', 'email',
        'response_time_hours', 24
    )
WHERE display_name = 'nanalysts';

UPDATE rextrix_user_profiles SET 
    location_details = jsonb_build_object(
        'region', 'アメリカ・カリフォルニア州',
        'remote_work_available', true,
        'international_available', true,
        'timezone', 'PST/PDT'
    ),
    contact_preferences = jsonb_build_object(
        'preferred_method', 'email',
        'response_time_hours', 48,
        'timezone_note', '日本時間でも対応可能'
    )
WHERE display_name = '菅原大源';

UPDATE rextrix_user_profiles SET 
    location_details = jsonb_build_object(
        'region', '北米',
        'remote_work_available', true,
        'international_available', true,
        'timezone', '日本時間対応可',
        'location_note', '北米在住／フルリモート'
    ),
    contact_preferences = jsonb_build_object(
        'preferred_method', 'email',
        'response_time_hours', 24,
        'timezone_support', '日本時間対応可'
    )
WHERE display_name = '田中（仮名）';

-- 確認クエリ
SELECT 
    'ENHANCED_CFO_CHECK' as section,
    display_name,
    jsonb_array_length(work_experiences) as work_exp_count,
    jsonb_array_length(detailed_certifications) as cert_count,
    CASE WHEN availability_conditions != '{}'::jsonb THEN '✅' ELSE '❌' END as availability_set,
    CASE WHEN compensation_details != '{}'::jsonb THEN '✅' ELSE '❌' END as compensation_set,
    CASE WHEN consultation_approach IS NOT NULL THEN '✅' ELSE '❌' END as approach_set
FROM rextrix_cfos 
WHERE display_name IN ('菅原大源', 'nanalysts', '田中（仮名）')
ORDER BY created_at DESC;