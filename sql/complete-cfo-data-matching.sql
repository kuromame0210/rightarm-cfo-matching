-- CFO_DATA.MDとデータベースを完全一致させる修正スクリプト
-- 段階的実行で問題箇所を特定しながら進める

-- Phase 1: 現状確認とクリーンアップ
-- 既存の不完全データを確認
SELECT 'CURRENT_STATE_CHECK' as phase;

-- 既存ユーザー確認
SELECT 
    'EXISTING_USERS' as check_type,
    email,
    user_type,
    id
FROM rextrix_users 
WHERE email IN ('dai88@example.com', 'okuda@example.com');

-- 既存プロフィール確認  
SELECT 
    'EXISTING_PROFILES' as check_type,
    up.user_id,
    up.display_name,
    up.region,
    u.email
FROM rextrix_user_profiles up
LEFT JOIN rextrix_users u ON up.user_id = u.id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com');

-- 既存CFOデータ確認
SELECT 
    'EXISTING_CFO_DATA' as check_type,
    c.user_id,
    c.title,
    c.experience_years,
    LENGTH(c.career_full_text) as career_text_length,
    u.email
FROM rextrix_cfos c
LEFT JOIN rextrix_users u ON c.user_id = u.id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com');

-- Phase 2: 不完全データのクリーンアップ
DELETE FROM rextrix_cfos 
WHERE user_id IN (
    SELECT id FROM rextrix_users 
    WHERE email IN ('dai88@example.com', 'okuda@example.com')
);

DELETE FROM rextrix_user_profiles 
WHERE user_id IN (
    SELECT id FROM rextrix_users 
    WHERE email IN ('dai88@example.com', 'okuda@example.com')
);

DELETE FROM rextrix_users 
WHERE email IN ('dai88@example.com', 'okuda@example.com');

-- Phase 3: 佐藤大悟さんの完全データ投入
DO $$
DECLARE
    dai88_user_id UUID := gen_random_uuid();
BEGIN
    -- Step 1: ユーザー作成
    INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
    VALUES (
        dai88_user_id, 
        'dai88@example.com', 
        'cfo', 
        NOW(), 
        NOW()
    );
    
    RAISE NOTICE '✅ Step 1: 佐藤大悟さんのユーザー作成完了: %', dai88_user_id;

    -- Step 2: 基本プロフィール作成（cfo_data.mdの【居住地】【紹介文】）
    INSERT INTO rextrix_user_profiles (
        user_id, display_name, phone_number, region, introduction, 
        work_preference, compensation_range, created_at, updated_at
    ) VALUES (
        dai88_user_id,
        '佐藤大悟',  -- 【名前】
        NULL,
        '千葉県千葉市',  -- 【居住地】
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',  -- 【紹介文】
        'hybrid',
        '月10万円〜、成果報酬応相談',  -- 【想定月額報酬】
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Step 2: 佐藤大悟さんの基本プロフィール作成完了';

    -- Step 3: CFO詳細プロフィール作成（cfo_data.mdの全項目対応）
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, is_available,
        career_full_text, skills_full_text, qualifications_text, 
        introduction_full_text, availability_text, compensation_text, service_area_text,
        created_at, updated_at
    ) VALUES (
        dai88_user_id,
        'クロスボーダーM&A・海外事業・USアップサポート専門家',
        23, -- 2001年卒業から計算
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。',
        true,
        
        -- 【経歴】完全保持（cfo_data.md 17-54行）
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
USでのIPOサポート、海外顧客への不動産コンサルティング等の業務
　　　　　　　　　　　　現在に至る

今まで7つの事業を行ってきました。2つはM&Aで売却しました。また、海外での事業としてフィリピン・セブ島で複数のビジネスを行いました、特に不動産は力を入れて不動産開発を華僑の仲間達と行いました。現在、開発した投資用ホテルは順調にホテルオペレーションが行われています。また、インバウンドをターゲットとした日本国内のリゾート地でのタイムシェア事業の準備を行っています。USでの投資銀行オーナー達と強いつながりがあるため、日系企業のUSでの上場サポートも行っていけます。',
        
        -- 【可能な業務】完全保持（cfo_data.md 58-62行）
        '・海外、英語を絡めた業務
・USへの上場希望会社のサポート（投資銀行、弁護士事務所、監査法人ご紹介含む）
・一般には出ていない投資案件の発掘
・不動産コンサルティング、各種ビジネスコンサルティング
・通訳、翻訳（ビジネス通訳、交渉は特に得意としています）',
        
        -- 【保有資格】（cfo_data.md 66行）
        '特に無し',
        
        -- 【紹介文】完全保持（cfo_data.md 78-79行）
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。
海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
        
        -- 【週の稼働可能時間】（cfo_data.md 15行）
        '応相談（臨機応変に対応致します）',
        
        -- 【想定月額報酬】（cfo_data.md 70行）
        '月10万円〜、成果報酬応相談',
        
        -- 【対応可能エリア】（cfo_data.md 74行）
        '全国リモートOK、東京近郊は対面可（案件次第では日本国内、海外への出張可）',
        
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Step 3: 佐藤大悟さんのCFO詳細プロフィール作成完了';

END $$;

-- Phase 4: 奥田豊さんの完全データ投入
DO $$
DECLARE
    okuda_user_id UUID := gen_random_uuid();
BEGIN
    -- Step 1: ユーザー作成
    INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
    VALUES (
        okuda_user_id, 
        'okuda@example.com', 
        'cfo', 
        NOW(), 
        NOW()
    );
    
    RAISE NOTICE '✅ Step 1: 奥田豊さんのユーザー作成完了: %', okuda_user_id;

    -- Step 2: 基本プロフィール作成
    INSERT INTO rextrix_user_profiles (
        user_id, display_name, phone_number, region, introduction, 
        work_preference, compensation_range, created_at, updated_at
    ) VALUES (
        okuda_user_id,
        '奥田豊',  -- 【名前】（cfo_data.md 104行）
        NULL,
        '奈良県生駒市',  -- 【居住地】（cfo_data.md 108行）
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',  -- 【紹介文】（cfo_data.md 139-140行）
        'hybrid',
        '成果報酬応相談、5,000円/h以上',  -- 【想定月額報酬】（cfo_data.md 131行）
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Step 2: 奥田豊さんの基本プロフィール作成完了';

    -- Step 3: CFO詳細プロフィール作成
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, is_available,
        career_full_text, skills_full_text, qualifications_text, 
        introduction_full_text, availability_text, compensation_text, service_area_text,
        created_at, updated_at
    ) VALUES (
        okuda_user_id,
        'IPO達成経験・銀行出身・中小企業診断士',
        18, -- 2006年から計算
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。',
        true,
        
        -- 【経歴】完全保持（cfo_data.md 117-119行）
        '2006年〜2008年:株式会社りそな銀行で法人融資業務
2008年〜2016年:日本発条株式会社で本社経理及び工場経理業務
2016年～2024年：エスネットワークス株式会社で財務コンサル及び（管理部）経理部門長業務',
        
        -- 【可能な業務】完全保持（cfo_data.md 123行）
        'IPO支援／事業計画策定/資金調達／M&A支援／管理会計導入／PMI支援/補助金申請',
        
        -- 【保有資格】完全保持（cfo_data.md 127行）
        '中小企業診断士、日商簿記１級',
        
        -- 【紹介文】完全保持（cfo_data.md 139-140行）
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。
また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
        
        -- 【週の稼働可能時間】（cfo_data.md 112行）
        '週２日・10時から18時',
        
        -- 【想定月額報酬】（cfo_data.md 131行）
        '成果報酬応相談、5,000円/h以上',
        
        -- 【対応可能エリア】（cfo_data.md 135行）
        '全国リモートOK、大阪近郊は対面可',
        
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Step 3: 奥田豊さんのCFO詳細プロフィール作成完了';

END $$;

-- Phase 5: 完全データマッチング検証
SELECT 'DATA_MATCHING_VERIFICATION' as phase;

-- 検証1: 基本プロフィール確認
SELECT 
    'PROFILE_VERIFICATION' as check_type,
    u.email,
    up.display_name,
    up.region,
    up.compensation_range,
    LENGTH(up.introduction) as intro_length
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com')
ORDER BY u.email;

-- 検証2: CFO詳細情報確認
SELECT 
    'CFO_DETAIL_VERIFICATION' as check_type,
    u.email,
    c.title,
    c.experience_years,
    LENGTH(c.career_full_text) as career_length,
    LENGTH(c.skills_full_text) as skills_length,
    c.qualifications_text,
    c.availability_text,
    c.compensation_text,
    c.service_area_text
FROM rextrix_users u
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com')
ORDER BY u.email;

-- 検証3: 検索機能テスト
SELECT 
    'SEARCH_TEST_M&A' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.career_full_text ILIKE '%M&A%' 
   OR c.skills_full_text ILIKE '%M&A%';

SELECT 
    'SEARCH_TEST_PHILIPPINES' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.career_full_text ILIKE '%フィリピン%';

SELECT 
    'SEARCH_TEST_IPO' as test_type,
    up.display_name,
    c.title
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.career_full_text ILIKE '%IPO%' 
   OR c.skills_full_text ILIKE '%IPO%';

-- 検証4: データ完全性確認
SELECT 
    'COMPLETENESS_CHECK' as check_type,
    COUNT(*) as total_users,
    COUNT(up.user_id) as profile_count,
    COUNT(c.user_id) as cfo_count
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.email IN ('dai88@example.com', 'okuda@example.com');

SELECT '✅ CFO_DATA.MDとデータベースの完全マッチング処理完了' as result;