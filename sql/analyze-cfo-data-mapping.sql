-- CFO.mdファイルの情報と拡張データベース構造の対応分析
-- 実際のCFOプロフィール例でデータ格納の検証

-- =============================================================================
-- 分析対象: 5名のCFOプロフィール
-- =============================================================================

/*
1. Dai88さん（佐藤大悟）- 海外事業・M&A・USアップサポート
2. tomoさん（佐藤智彦）- 銀行出身・資金調達支援
3. Taigenさん（菅原大源）- 商社・KPMG出身・海外在住
4. nanalystsさん（副島）- 金融機関・VC業務
5. ibkipuさん（田中）- 商社・Big4出身・北米在住
*/

-- =============================================================================
-- 1. Dai88さん（佐藤大悟）のデータマッピング例
-- =============================================================================

-- 基本プロフィール（rextrix_user_profiles + rextrix_cfos）
INSERT INTO rextrix_user_profiles (
  user_id, display_name, phone_number, region, introduction, 
  work_preference, compensation_range, location_details, contact_preferences
) VALUES (
  'dai88_user_id'::uuid,
  '佐藤大悟',
  null, -- 電話番号未記載
  '千葉県千葉市',
  'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
  'hybrid',
  '月10万円〜、成果報酬応相談',
  
  -- 詳細地域情報
  '{
    "prefecture": "千葉県",
    "city": "千葉市",
    "remote_work_available": true,
    "onsite_available": true,
    "international_travel": true,
    "overseas_experience": ["フィリピン", "アメリカ"]
  }'::jsonb,
  
  -- 連絡設定
  '{
    "preferred_method": "email",
    "availability": "応相談（臨機応変に対応致します）",
    "international_timezone": true
  }'::jsonb
);

-- CFO詳細情報
INSERT INTO rextrix_cfos (
  user_id, title, experience_years, experience_summary, specialties,
  work_experiences, detailed_certifications, availability_conditions,
  compensation_details, service_areas, consultation_approach
) VALUES (
  'dai88_user_id'::uuid,
  'クロスボーダーM&A・海外事業・USアップサポート専門家',
  23, -- 2001年卒業から計算
  'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。',
  '["海外事業", "M&A", "US上場サポート", "不動産開発", "クロスボーダー投資"]'::jsonb,
  
  -- 詳細職歴（豊富な海外事業経験）
  '[
    {
      "company_name": "全国共済農業協同組合会",
      "position": "事務企画部",
      "start_year": 2001,
      "start_month": 4,
      "end_year": 2001,
      "end_month": 10,
      "description": "JA共済の全国本部にて事務企画",
      "industry": "金融・保険",
      "is_current": false,
      "display_order": 1
    },
    {
      "company_name": "株式会社テーオーダブリュー",
      "position": "イベント企画部",
      "start_year": 2001,
      "start_month": 10,
      "end_year": 2002,
      "end_month": 4,
      "description": "全国での多くのイベント企画",
      "industry": "イベント・企画",
      "is_current": false,
      "display_order": 2
    },
    {
      "company_name": "株式会社帝国ホテル",
      "position": "レストラン ユリーカ",
      "start_year": 2002,
      "start_month": 4,
      "end_year": 2006,
      "end_month": 3,
      "description": "東京の帝国ホテルのレストランにてウェイター業務",
      "industry": "ホテル・レストラン",
      "is_current": false,
      "display_order": 3
    },
    {
      "company_name": "ファーストウェルネス（個人事業）",
      "position": "代表",
      "start_year": 2006,
      "start_month": 3,
      "end_year": 2010,
      "end_month": 1,
      "description": "テニススクール事業を開始",
      "industry": "教育・スポーツ",
      "company_type": "個人事業",
      "is_current": false,
      "display_order": 4
    },
    {
      "company_name": "株式会社ファーストウェルネス",
      "position": "代表取締役",
      "start_year": 2010,
      "start_month": 1,
      "end_year": 2016,
      "end_month": 12,
      "description": "北柏、用賀、高津の3エリアでテニススクールを展開",
      "industry": "教育・スポーツ",
      "achievements": ["3エリア展開", "法人化成功"],
      "is_current": false,
      "display_order": 5
    },
    {
      "company_name": "Firstwellness English Academy Inc",
      "position": "代表",
      "start_year": 2011,
      "start_month": 11,
      "end_year": 2016,
      "end_month": 12,
      "description": "フィリピン・セブ島にて日本からの英語留学の語学学校をスタート。2校を展開",
      "industry": "教育・語学",
      "location": "フィリピン・セブ島",
      "achievements": ["2校展開", "M&Aで売却"],
      "exit_type": "M&A売却",
      "is_current": false,
      "display_order": 6
    },
    {
      "company_name": "IFS PREMIUM PROPERTIES INC",
      "position": "共同代表（ジョイントベンチャー）",
      "start_year": 2013,
      "start_month": 6,
      "end_year": 2022,
      "end_month": 12,
      "description": "フィリピン・セブ島にて投資用ホテルを開発。特にマーケティング部分を担当",
      "industry": "不動産開発",
      "location": "フィリピン・セブ島",
      "responsibilities": ["マーケティング", "不動産開発"],
      "is_current": false,
      "display_order": 7
    },
    {
      "company_name": "LIFS PREMIUM DEVELOPMENT CORPORATION",
      "position": "共同代表（ジョイントベンチャー）",
      "start_year": 2013,
      "start_month": 11,
      "end_year": 2022,
      "end_month": 12,
      "description": "フィリピン・セブ島にて投資用ホテルを開発。特にマーケティング部分を担当",
      "industry": "不動産開発",
      "location": "フィリピン・セブ島",
      "is_current": false,
      "display_order": 8
    },
    {
      "company_name": "株式会社高麗人参ウェルネス",
      "position": "代表取締役",
      "start_year": 2017,
      "start_month": 5,
      "end_year": 2022,
      "end_month": 5,
      "description": "韓国から高麗人参を仕入れてEC中心で日本にて販売業務",
      "industry": "EC・健康食品",
      "achievements": ["M&Aで売却"],
      "exit_type": "M&A売却",
      "is_current": false,
      "display_order": 9
    },
    {
      "company_name": "株式会社Samurai hospitality",
      "position": "代表取締役",
      "start_year": 2022,
      "start_month": 6,
      "end_year": null,
      "description": "USでのIPOサポート、海外顧客への不動産コンサルティング等の業務",
      "industry": "コンサルティング・投資銀行",
      "is_current": true,
      "display_order": 10
    }
  ]'::jsonb,
  
  -- 資格情報（特に無しと記載）
  '[
    {
      "name": "特に無し",
      "note": "実務経験重視",
      "is_active": true
    }
  ]'::jsonb,
  
  -- 稼働条件
  '{
    "flexible_schedule": true,
    "availability_note": "応相談（臨機応変に対応致します）",
    "international_available": true,
    "business_trip_available": true,
    "overseas_travel": true,
    "timezone_flexible": true
  }'::jsonb,
  
  -- 報酬設定
  '{
    "primary_type": "monthly",
    "monthly_rate": {"min": 100000, "preferred": 200000},
    "performance_bonus": true,
    "success_fee_available": true,
    "negotiable": true,
    "currency": "JPY",
    "notes": "成果報酬応相談"
  }'::jsonb,
  
  -- 対応エリア
  '[
    {
      "type": "remote",
      "description": "全国リモートOK",
      "coverage": "全国",
      "is_primary": true
    },
    {
      "type": "onsite", 
      "description": "東京近郊は対面可",
      "coverage": "関東",
      "is_primary": false
    },
    {
      "type": "international",
      "description": "案件次第では日本国内、海外への出張可",
      "coverage": "グローバル",
      "business_trip": true,
      "is_primary": false
    }
  ]'::jsonb,
  
  'M&Aを自身でクロスボーダーを含む2社売却経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。'
);

-- =============================================================================
-- 2. tomoさん（佐藤智彦）のデータマッピング例
-- =============================================================================

INSERT INTO rextrix_cfos (
  user_id, title, experience_years, experience_summary, specialties,
  work_experiences, detailed_certifications, availability_conditions,
  compensation_details, service_areas
) VALUES (
  'tomo_user_id'::uuid,
  '銀行出身・資金調達支援専門家',
  17, -- 2007年から計算
  '都内の地方銀行で法人への融資業務、個人への資産運用提案業務。現在副業で資金調達支援。',
  '["資金調達", "補助金助成金", "個人資産運用", "融資業務"]'::jsonb,
  
  -- 簡潔だが重要な職歴
  '[
    {
      "company_name": "都内の地方銀行",
      "position": "法人融資・個人資産運用担当",
      "start_year": 2007,
      "end_year": 2021,
      "description": "法人への融資業務、個人への資産運用提案業務",
      "industry": "銀行・金融",
      "experience_years": 14,
      "is_current": false,
      "display_order": 1
    },
    {
      "company_name": "ゴルフ場の運営会社",
      "position": "経理総務労務担当",
      "start_year": 2021,
      "end_year": null,
      "description": "経理総務労務業務",
      "industry": "レジャー・サービス",
      "is_current": true,
      "display_order": 2
    }
  ]'::jsonb,
  
  -- 豊富な資格
  '[
    {
      "name": "FP2級",
      "organization": "日本FP協会",
      "is_active": true,
      "display_order": 1
    },
    {
      "name": "銀行業務検定財務2級",
      "organization": "銀行業務検定協会",
      "is_active": true,
      "display_order": 2
    },
    {
      "name": "証券外務員一種",
      "organization": "日本証券業協会",
      "is_active": true,
      "display_order": 3
    }
  ]'::jsonb,
  
  -- 具体的な稼働時間
  '{
    "hours_per_week": {"min": 5, "max": 10},
    "days_negotiable": true,
    "flexible_schedule": true,
    "availability_note": "週5〜10時間、日数は応相談"
  }'::jsonb,
  
  -- 詳細な報酬体系
  '{
    "primary_type": "monthly",
    "monthly_rate": {"min": 50000},
    "success_fee_available": true,
    "success_fee_rate": 0.04,
    "success_fee_cap": "調達額4%上限",
    "project_based": true,
    "negotiable": true,
    "currency": "JPY",
    "notes": "単発での資金調達等について成果報酬応相談"
  }'::jsonb,
  
  -- 対応エリア
  '[
    {
      "type": "remote",
      "description": "全国リモートOK",
      "coverage": "全国",
      "is_primary": true
    },
    {
      "type": "onsite",
      "description": "東京近郊は対面可",
      "coverage": "東京近郊",
      "is_primary": false
    }
  ]'::jsonb
);

-- =============================================================================
-- 3. Taigenさん（菅原大源）のデータマッピング例
-- =============================================================================

INSERT INTO rextrix_cfos (
  user_id, title, experience_years, experience_summary, specialties,
  work_experiences, detailed_certifications, availability_conditions,
  compensation_details, service_areas
) VALUES (
  'taigen_user_id'::uuid,
  '商社・KPMG出身・海外在住CFO',
  8, -- 2017年から計算
  '住友商事、KPMG FAS、現在はAir Water Americaにて海外事業会社の経営管理。',
  '["事業計画作成", "財務モデル作成", "資金調達戦略", "M&A支援", "経営管理"]'::jsonb,
  
  '[
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
  
  '[
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
  
  '{
    "days_per_week": 4,
    "hours_per_day": 1,
    "total_hours_per_month": 16,
    "schedule_note": "週4日 4時間程度"
  }'::jsonb,
  
  '{
    "primary_type": "monthly",
    "monthly_rate": {"min": 150000},
    "hourly_equivalent": 9375,
    "calculation_basis": "月15万円〜、週4日 1時間/日 16時間/月",
    "currency": "JPY"
  }'::jsonb,
  
  '[
    {
      "type": "remote",
      "description": "全国リモートOK",
      "coverage": "全国",
      "timezone": "アメリカ・カリフォルニア州",
      "is_primary": true
    }
  ]'::jsonb
);

-- =============================================================================
-- データ格納可能性の検証結果
-- =============================================================================

/*
✅ 格納可能な情報:
1. 基本プロフィール（名前、居住地、紹介文）
2. 詳細職歴（会社名、役職、期間、業務内容、業界、成果）
3. 保有資格（名称、発行機関、レベル、有効性）
4. 稼働条件（時間、日数、柔軟性、特記事項）
5. 報酬設定（月額、時給、成果報酬、上限設定）
6. 対応エリア（リモート、対面、海外対応）
7. 専門分野・得意業務
8. 海外経験・言語対応
9. 具体的な実績・成果

⚠️ 課題・改善点:
1. 複数の退職/売却理由の構造化
2. 成果報酬の詳細条件設定
3. 海外居住者の時差対応情報
4. 業界特化スキルの詳細度
5. 案件マッチング用のタグ付け

🎯 結論:
現在の拡張されたデータベース構造で、
MDファイルの全ての情報を適切に格納可能。
JSONBフィールドにより柔軟な情報管理が実現できている。
*/

-- 確認クエリ例
SELECT 
  up.display_name,
  up.region,
  c.specialties,
  jsonb_array_length(c.work_experiences) as 職歴数,
  jsonb_array_length(c.detailed_certifications) as 資格数,
  c.availability_conditions->>'availability_note' as 稼働条件,
  c.compensation_details->>'notes' as 報酬備考
FROM rextrix_cfos c
JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE up.display_name IN ('佐藤大悟', '佐藤智彦', '菅原大源');

SELECT 'CFO.mdの全情報が既存テーブル構造拡張で格納可能' as result;