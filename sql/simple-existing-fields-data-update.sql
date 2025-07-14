-- 既存フィールドを活用したcfo_data.mdの適切なデータ投入
-- 新しいフィールド追加なし、既存設計の最大活用

-- Phase 1: 現在のデータ状況確認
SELECT 'CURRENT_DATA_CHECK' as phase;

SELECT 
    'EXISTING_USERS' as check_type,
    u.email,
    u.user_type,
    up.display_name,
    up.region,
    up.work_preference,
    up.compensation_range,
    LENGTH(COALESCE(up.introduction, '')) as intro_length
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com');

SELECT 
    'EXISTING_CFO_DATA' as check_type,
    u.email,
    c.title,
    c.experience_years,
    LENGTH(COALESCE(c.experience_summary, '')) as summary_length,
    c.specialties,
    c.is_available
FROM rextrix_users u
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com');

-- Phase 2: 佐藤大悟さんのデータ完全更新
DO $$
DECLARE
    dai88_user_id UUID;
BEGIN
    -- ユーザーIDを取得または作成
    SELECT id INTO dai88_user_id FROM rextrix_users WHERE email = 'dai88@example.com';
    
    IF dai88_user_id IS NULL THEN
        -- 新規ユーザー作成
        INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
        VALUES (gen_random_uuid(), 'dai88@example.com', 'cfo', NOW(), NOW())
        RETURNING id INTO dai88_user_id;
        
        RAISE NOTICE '✅ 佐藤大悟さんのユーザー新規作成: %', dai88_user_id;
    ELSE
        RAISE NOTICE '✅ 佐藤大悟さんの既存ユーザー使用: %', dai88_user_id;
    END IF;

    -- ユーザープロフィールの更新・作成（既存フィールド活用）
    INSERT INTO rextrix_user_profiles (
        user_id, display_name, phone_number, region, introduction, 
        work_preference, compensation_range, created_at, updated_at
    ) VALUES (
        dai88_user_id,
        '佐藤大悟',  -- 【名前】
        NULL,
        '千葉県千葉市',  -- 【居住地】
        
        -- 【紹介文】詳細版（既存introductionフィールド活用）
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。

今まで7つの事業を行ってきました。2つはM&Aで売却しました。また、海外での事業としてフィリピン・セブ島で複数のビジネスを行いました、特に不動産は力を入れて不動産開発を華僑の仲間達と行いました。現在、開発した投資用ホテルは順調にホテルオペレーションが行われています。また、インバウンドをターゲットとした日本国内のリゾート地でのタイムシェア事業の準備を行っています。USでの投資銀行オーナー達と強いつながりがあるため、日系企業のUSでの上場サポートも行っていけます。',
        
        '応相談（臨機応変に対応致します）',  -- 【週の稼働可能時間】
        '月10万円〜、成果報酬応相談',  -- 【想定月額報酬】
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

    -- CFOプロフィールの更新・作成（既存フィールド最大活用）
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, 
        specialties, is_available, created_at, updated_at
    ) VALUES (
        dai88_user_id,
        'クロスボーダーM&A・海外事業・USアップサポート専門家',
        23, -- 2001年卒業から計算
        
        -- 【経歴】完全版（既存experience_summaryフィールド活用）
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
        
        -- 【可能な業務】（既存specialtiesフィールド活用、LIKE検索対応）
        '海外・英語を絡めた業務、USへの上場希望会社のサポート（投資銀行・弁護士事務所・監査法人ご紹介含む）、一般には出ていない投資案件の発掘、不動産コンサルティング・各種ビジネスコンサルティング、通訳・翻訳（ビジネス通訳・交渉は特に得意）、M&A支援、クロスボーダー投資、フィリピン事業、セブ島不動産開発、IPOサポート、資金調達支援',
        
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

-- Phase 3: 奥田豊さんのデータ完全更新
DO $$
DECLARE
    okuda_user_id UUID;
BEGIN
    -- ユーザーIDを取得または作成
    SELECT id INTO okuda_user_id FROM rextrix_users WHERE email = 'okuda@example.com';
    
    IF okuda_user_id IS NULL THEN
        -- 新規ユーザー作成
        INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
        VALUES (gen_random_uuid(), 'okuda@example.com', 'cfo', NOW(), NOW())
        RETURNING id INTO okuda_user_id;
        
        RAISE NOTICE '✅ 奥田豊さんのユーザー新規作成: %', okuda_user_id;
    ELSE
        RAISE NOTICE '✅ 奥田豊さんの既存ユーザー使用: %', okuda_user_id;
    END IF;

    -- ユーザープロフィールの更新・作成
    INSERT INTO rextrix_user_profiles (
        user_id, display_name, phone_number, region, introduction, 
        work_preference, compensation_range, created_at, updated_at
    ) VALUES (
        okuda_user_id,
        '奥田豊',  -- 【名前】
        NULL,
        '奈良県生駒市',  -- 【居住地】
        
        -- 【紹介文】詳細版
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
        
        '週２日・10時から18時',  -- 【週の稼働可能時間】
        '成果報酬応相談、5,000円/h以上',  -- 【想定月額報酬】
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

    -- CFOプロフィールの更新・作成
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, 
        specialties, is_available, created_at, updated_at
    ) VALUES (
        okuda_user_id,
        'IPO達成経験・銀行出身・中小企業診断士',
        18, -- 2006年から計算
        
        -- 【経歴】完全版
        '2006年〜2008年:株式会社りそな銀行で法人融資業務
2008年〜2016年:日本発条株式会社で本社経理及び工場経理業務
2016年～2024年：エスネットワークス株式会社で財務コンサル及び（管理部）経理部門長業務

【対応可能エリア】全国リモートOK、大阪近郊は対面可
【保有資格】中小企業診断士、日商簿記１級',
        
        -- 【可能な業務】（LIKE検索対応）
        'IPO支援、事業計画策定、資金調達、M&A支援、管理会計導入、PMI支援、補助金申請、法人融資、経理業務、財務コンサルティング、経理部門長業務、銀行業務、製造業経理、IT企業財務',
        
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

-- Phase 4: データ投入結果の確認
SELECT 'DATA_UPDATE_VERIFICATION' as phase;

-- 更新後のプロフィール確認
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

-- 更新後のCFOデータ確認
SELECT 
    'UPDATED_CFO_DATA' as check_type,
    u.email,
    c.title,
    c.experience_years,
    LENGTH(c.experience_summary) as summary_length,
    LENGTH(c.specialties) as specialties_length,
    c.is_available
FROM rextrix_users u
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com')
ORDER BY u.email;

-- LIKE検索テスト（M&A）
SELECT 
    'SEARCH_TEST_MA' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.experience_summary ILIKE '%M&A%' 
   OR c.specialties ILIKE '%M&A%'
   OR up.introduction ILIKE '%M&A%';

-- LIKE検索テスト（フィリピン）
SELECT 
    'SEARCH_TEST_PHILIPPINES' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.experience_summary ILIKE '%フィリピン%'
   OR c.specialties ILIKE '%フィリピン%';

-- LIKE検索テスト（IPO）
SELECT 
    'SEARCH_TEST_IPO' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.experience_summary ILIKE '%IPO%' 
   OR c.specialties ILIKE '%IPO%';

-- LIKE検索テスト（銀行）
SELECT 
    'SEARCH_TEST_BANK' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.experience_summary ILIKE '%銀行%' 
   OR c.specialties ILIKE '%銀行%';

SELECT '✅ 既存フィールドを活用したcfo_data.mdデータ投入完了' as result;