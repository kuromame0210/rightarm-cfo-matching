-- JSONB型対応版: 既存フィールドを活用したcfo_data.mdデータ投入
-- specialtiesフィールドの正しいJSONB配列形式に対応

-- Phase 1: 現在のフィールド型確認
SELECT 'FIELD_TYPE_CHECK' as phase;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfos' 
  AND column_name IN ('specialties', 'experience_summary', 'certifications')
ORDER BY column_name;

-- Phase 2: 佐藤大悟さんのデータ投入（JSONB配列対応）
DO $$
DECLARE
    dai88_user_id UUID;
BEGIN
    -- ユーザーIDを取得または作成
    SELECT id INTO dai88_user_id FROM rextrix_users WHERE email = 'dai88@example.com';
    
    IF dai88_user_id IS NULL THEN
        INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
        VALUES (gen_random_uuid(), 'dai88@example.com', 'cfo', NOW(), NOW())
        RETURNING id INTO dai88_user_id;
        RAISE NOTICE '✅ 佐藤大悟さんのユーザー新規作成: %', dai88_user_id;
    ELSE
        RAISE NOTICE '✅ 佐藤大悟さんの既存ユーザー使用: %', dai88_user_id;
    END IF;

    -- ユーザープロフィール投入
    INSERT INTO rextrix_user_profiles (
        user_id, display_name, phone_number, region, introduction, 
        work_preference, compensation_range, created_at, updated_at
    ) VALUES (
        dai88_user_id,
        '佐藤大悟',
        NULL,
        '千葉県千葉市',
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。今まで7つの事業を行ってきました。2つはM&Aで売却しました。フィリピン・セブ島で複数のビジネスを行い、特に不動産開発を華僑の仲間達と行いました。現在、開発した投資用ホテルは順調にホテルオペレーションが行われています。USでの投資銀行オーナー達と強いつながりがあるため、日系企業のUSでの上場サポートも行っていけます。',
        '応相談（臨機応変に対応致します）',
        '月10万円〜、成果報酬応相談',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        region = EXCLUDED.region,
        introduction = EXCLUDED.introduction,
        work_preference = EXCLUDED.work_preference,
        compensation_range = EXCLUDED.compensation_range,
        updated_at = NOW();

    RAISE NOTICE '✅ 佐藤大悟さんのプロフィール更新完了';

    -- CFOプロフィール投入（JSONB配列形式）
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, 
        specialties, is_available, created_at, updated_at
    ) VALUES (
        dai88_user_id,
        'クロスボーダーM&A・海外事業・USアップサポート専門家',
        23,
        '2001,03 明治大学法学部法律学科卒業

2001,04 全国共済農業協同組合会　全国本部　事務企画部　入会
　　JA共済の全国本部にて事務企画で携わる

2001,10 株式会社テーオーダブリュー　イベント企画部　入社
　　全国での多くのイベント企画に携わる

2002,04 株式会社帝国ホテル　レストラン　ユリーカ　入社
　　　　　東京の帝国ホテルのレストランにてウェイター業務

2006,03　 個人事業ファーストウェルネスとしてテニススクール事業を開始

2010, 01 ファーストウェルネスを法人化して株式会社ファーストウェルネス設立
　　　　　北柏、用賀、高津の3エリアでテニススクールを展開

2011,11 フィリピン・セブ島にてFirstwellness English Academy Incを設立
　　　　　日本からの英語留学の語学学校をスタート。2校を展開

2013, 06 IFS PREMIUM PROPERTIES INCをジョイントベンチャーで設立
　　　　フィリピン・セブ島にて投資用ホテルを開発。特にマーケティング部分を担当

2013,11 LIFS PREMIUM DEVELOPMENT CORPORATIONをジョイントベンチャーで設立。フィリピン・セブ島にて投資用ホテルを開発。特にマーケティング部分を担当

2016,12 フィリピン・セブ島におけるFirstwellness English Academy IncをM&Aで売却

2017,05 株式会社高麗人参ウェルネスを設立
　　　　韓国から高麗人参を仕入れてEC中心で日本にて販売業務

2022,05 株式会社高麗人参ウェルネスをM&Aで売却

2022,06 株式会社Samurai hospitalityを設立
USでのIPOサポート、海外顧客への不動産コンサルティング等の業務　現在に至る

【対応可能エリア】全国リモートOK、東京近郊は対面可（案件次第では日本国内、海外への出張可）
【保有資格】特に無し',
        
        -- specialtiesを正しいJSONB配列形式で投入
        '["海外業務", "英語業務", "US上場サポート", "IPOサポート", "投資銀行紹介", "弁護士事務所紹介", "監査法人紹介", "投資案件発掘", "不動産コンサルティング", "ビジネスコンサルティング", "通訳", "翻訳", "ビジネス通訳", "交渉", "M&A支援", "クロスボーダーM&A", "資金調達支援", "フィリピン事業", "セブ島事業", "不動産開発", "ホテル開発", "語学学校運営", "テニススクール", "EC事業", "高麗人参販売"]'::jsonb,
        
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        title = EXCLUDED.title,
        experience_years = EXCLUDED.experience_years,
        experience_summary = EXCLUDED.experience_summary,
        specialties = EXCLUDED.specialties,
        is_available = EXCLUDED.is_available,
        updated_at = NOW();

    RAISE NOTICE '✅ 佐藤大悟さんのCFO詳細プロフィール更新完了';

END $$;

-- Phase 3: 奥田豊さんのデータ投入（JSONB配列対応）
DO $$
DECLARE
    okuda_user_id UUID;
BEGIN
    -- ユーザーIDを取得または作成
    SELECT id INTO okuda_user_id FROM rextrix_users WHERE email = 'okuda@example.com';
    
    IF okuda_user_id IS NULL THEN
        INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
        VALUES (gen_random_uuid(), 'okuda@example.com', 'cfo', NOW(), NOW())
        RETURNING id INTO okuda_user_id;
        RAISE NOTICE '✅ 奥田豊さんのユーザー新規作成: %', okuda_user_id;
    ELSE
        RAISE NOTICE '✅ 奥田豊さんの既存ユーザー使用: %', okuda_user_id;
    END IF;

    -- ユーザープロフィール投入
    INSERT INTO rextrix_user_profiles (
        user_id, display_name, phone_number, region, introduction, 
        work_preference, compensation_range, created_at, updated_at
    ) VALUES (
        okuda_user_id,
        '奥田豊',
        NULL,
        '奈良県生駒市',
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
        '週２日・10時から18時',
        '成果報酬応相談、5,000円/h以上',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        region = EXCLUDED.region,
        introduction = EXCLUDED.introduction,
        work_preference = EXCLUDED.work_preference,
        compensation_range = EXCLUDED.compensation_range,
        updated_at = NOW();

    RAISE NOTICE '✅ 奥田豊さんのプロフィール更新完了';

    -- CFOプロフィール投入（JSONB配列形式）
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, 
        specialties, is_available, created_at, updated_at
    ) VALUES (
        okuda_user_id,
        'IPO達成経験・銀行出身・中小企業診断士',
        18,
        '2006年〜2008年:株式会社りそな銀行で法人融資業務
2008年〜2016年:日本発条株式会社で本社経理及び工場経理業務
2016年～2024年：エスネットワークス株式会社で財務コンサル及び（管理部）経理部門長業務

【対応可能エリア】全国リモートOK、大阪近郊は対面可
【保有資格】中小企業診断士、日商簿記１級',
        
        -- specialtiesを正しいJSONB配列形式で投入
        '["IPO支援", "IPO準備", "IPO達成", "事業計画策定", "資金調達", "融資業務", "法人融資", "M&A支援", "管理会計導入", "PMI支援", "補助金申請", "銀行業務", "経理業務", "財務コンサル", "経理部門長", "本社経理", "工場経理", "中小企業診断士", "簿記1級", "製造業経理", "IT企業財務", "事業会社経験", "銀行経験"]'::jsonb,
        
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        title = EXCLUDED.title,
        experience_years = EXCLUDED.experience_years,
        experience_summary = EXCLUDED.experience_summary,
        specialties = EXCLUDED.specialties,
        is_available = EXCLUDED.is_available,
        updated_at = NOW();

    RAISE NOTICE '✅ 奥田豊さんのCFO詳細プロフィール更新完了';

END $$;

-- Phase 4: データ投入結果の検証
SELECT 'DATA_VERIFICATION' as phase;

-- 投入データ確認
SELECT 
    'UPDATED_PROFILES' as check_type,
    u.email,
    up.display_name,
    up.region,
    up.work_preference,
    up.compensation_range,
    LENGTH(up.introduction) as intro_length
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com')
ORDER BY u.email;

-- CFOデータ確認
SELECT 
    'UPDATED_CFO_DATA' as check_type,
    u.email,
    c.title,
    c.experience_years,
    LENGTH(c.experience_summary) as summary_length,
    jsonb_array_length(c.specialties) as specialties_count,
    c.is_available
FROM rextrix_users u
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com')
ORDER BY u.email;

-- JSONB配列検索テスト（M&A）
SELECT 
    'JSONB_SEARCH_TEST_MA' as test_type,
    up.display_name,
    c.title,
    c.specialties ? 'M&A支援' as has_ma_skill
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.specialties ? 'M&A支援'  -- JSONB配列内検索
   OR c.experience_summary ILIKE '%M&A%';

-- JSONB配列検索テスト（IPO）
SELECT 
    'JSONB_SEARCH_TEST_IPO' as test_type,
    up.display_name,
    c.title,
    c.specialties ? 'IPO支援' as has_ipo_skill
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.specialties ? 'IPO支援'  -- JSONB配列内検索
   OR c.experience_summary ILIKE '%IPO%';

-- JSONB配列検索テスト（フィリピン）
SELECT 
    'JSONB_SEARCH_TEST_PHILIPPINES' as test_type,
    up.display_name,
    c.title,
    c.specialties ? 'フィリピン事業' as has_philippines_skill
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.specialties ? 'フィリピン事業'  -- JSONB配列内検索
   OR c.experience_summary ILIKE '%フィリピン%';

-- specialties配列の内容確認
SELECT 
    'SPECIALTIES_CONTENT' as check_type,
    up.display_name,
    c.specialties
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com')
ORDER BY up.display_name;

SELECT '✅ JSONB配列対応版データ投入・検証完了' as result;