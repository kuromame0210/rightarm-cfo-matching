-- シンプルなテキストベースCFOプロフィール実装（日本語インデックス修正版）
-- 日本語全文検索を削除してシンプルなLIKE検索に特化

-- Phase 1: シンプルなテキストカラムを追加
ALTER TABLE rextrix_cfos 
ADD COLUMN IF NOT EXISTS career_full_text TEXT,        -- 経歴原文
ADD COLUMN IF NOT EXISTS skills_full_text TEXT,       -- 可能業務原文  
ADD COLUMN IF NOT EXISTS qualifications_text TEXT,    -- 保有資格原文
ADD COLUMN IF NOT EXISTS introduction_full_text TEXT, -- 紹介文原文
ADD COLUMN IF NOT EXISTS availability_text TEXT,      -- 稼働時間原文
ADD COLUMN IF NOT EXISTS compensation_text TEXT,      -- 報酬情報原文
ADD COLUMN IF NOT EXISTS service_area_text TEXT;      -- 対応エリア原文

-- Phase 2: Dai88さん（佐藤大悟）のプロフィール追加
DO $$
DECLARE
    dai88_user_id UUID := gen_random_uuid();
    existing_user_id UUID;
BEGIN
    -- 既存ユーザーチェック
    SELECT id INTO existing_user_id FROM rextrix_users WHERE email = 'dai88@example.com';
    
    IF existing_user_id IS NULL THEN
        -- 新規ユーザー作成
        INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
        VALUES (
            dai88_user_id, 
            'dai88@example.com', 
            'cfo', 
            NOW(), 
            NOW()
        );
    ELSE
        -- 既存ユーザーIDを使用
        dai88_user_id := existing_user_id;
    END IF;

    -- ユーザープロフィール作成・更新
    INSERT INTO rextrix_user_profiles (user_id, display_name, phone_number, region, introduction, created_at, updated_at)
    VALUES (
        dai88_user_id,
        '佐藤大悟',
        NULL,
        '千葉県千葉市',
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        region = EXCLUDED.region,
        introduction = EXCLUDED.introduction,
        updated_at = NOW();

    -- 既存CFOプロフィールを削除してから新規作成
    DELETE FROM rextrix_cfos WHERE user_id = dai88_user_id;
    
    -- CFOプロフィール作成
    INSERT INTO rextrix_cfos (
        user_id, title, experience_years, experience_summary, is_available,
        career_full_text, skills_full_text, qualifications_text, 
        introduction_full_text, availability_text, compensation_text, service_area_text,
        created_at, updated_at
    ) VALUES (
        dai88_user_id,
        'クロスボーダーM&A・海外事業・USアップサポート専門家',
        23, -- 2001年卒業から計算
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。',
        true,
        
        -- 経歴原文（完全保持）
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
        
        -- 可能業務原文
        '・海外、英語を絡めた業務
・USへの上場希望会社のサポート（投資銀行、弁護士事務所、監査法人ご紹介含む）
・一般には出ていない投資案件の発掘
・不動産コンサルティング、各種ビジネスコンサルティング
・通訳、翻訳（ビジネス通訳、交渉は特に得意としています）',
        
        -- 保有資格原文
        '特に無し',
        
        -- 紹介文原文
        'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。
海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
        
        -- 稼働時間原文
        '応相談（臨機応変に対応致します）',
        
        -- 報酬原文
        '月10万円〜、成果報酬応相談',
        
        -- 対応エリア原文
        '全国リモートOK、東京近郊は対面可（案件次第では日本国内、海外への出張可）',
        
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Dai88さんのプロフィールを作成しました: %', dai88_user_id;
END $$;

-- Phase 3: 奥田さん（奥田豊）のプロフィール追加
DO $$
DECLARE
    okuda_user_id UUID := gen_random_uuid();
    existing_user_id UUID;
BEGIN
    -- 既存ユーザーチェック
    SELECT id INTO existing_user_id FROM rextrix_users WHERE email = 'okuda@example.com';
    
    IF existing_user_id IS NULL THEN
        -- 新規ユーザー作成
        INSERT INTO rextrix_users (id, email, user_type, created_at, updated_at)
        VALUES (
            okuda_user_id, 
            'okuda@example.com', 
            'cfo', 
            NOW(), 
            NOW()
        );
    ELSE
        -- 既存ユーザーIDを使用
        okuda_user_id := existing_user_id;
    END IF;

    -- ユーザープロフィール作成・更新
    INSERT INTO rextrix_user_profiles (user_id, display_name, phone_number, region, introduction, created_at, updated_at)
    VALUES (
        okuda_user_id,
        '奥田豊',
        NULL,
        '奈良県生駒市',
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        region = EXCLUDED.region,
        introduction = EXCLUDED.introduction,
        updated_at = NOW();

    -- 既存CFOプロフィールを削除してから新規作成
    DELETE FROM rextrix_cfos WHERE user_id = okuda_user_id;
    
    -- CFOプロフィール作成
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
        
        -- 経歴原文（完全保持）
        '2006年〜2008年:株式会社りそな銀行で法人融資業務
2008年〜2016年:日本発条株式会社で本社経理及び工場経理業務
2016年～2024年：エスネットワークス株式会社で財務コンサル及び（管理部）経理部門長業務',
        
        -- 可能業務原文
        'IPO支援／事業計画策定/資金調達／M&A支援／管理会計導入／PMI支援/補助金申請',
        
        -- 保有資格原文
        '中小企業診断士、日商簿記１級',
        
        -- 紹介文原文
        '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。
また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
        
        -- 稼働時間原文
        '週２日・10時から18時',
        
        -- 報酬原文
        '成果報酬応相談、5,000円/h以上',
        
        -- 対応エリア原文
        '全国リモートOK、大阪近郊は対面可',
        
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '奥田さんのプロフィールを作成しました: %', okuda_user_id;
END $$;

-- Phase 4: シンプルなインデックス作成（日本語全文検索は使用しない）
-- LIKE検索用の基本的なインデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_career_text 
ON rextrix_cfos (career_full_text);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_skills_text 
ON rextrix_cfos (skills_full_text);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_qualifications_text 
ON rextrix_cfos (qualifications_text);

-- Phase 5: 確認クエリ
SELECT 
    'TEXT_BASED_CFO_CHECK' as section,
    up.display_name,
    LENGTH(c.career_full_text) as career_text_length,
    LENGTH(c.skills_full_text) as skills_text_length,
    CASE WHEN c.career_full_text IS NOT NULL THEN '✅' ELSE '❌' END as career_stored,
    CASE WHEN c.skills_full_text IS NOT NULL THEN '✅' ELSE '❌' END as skills_stored
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE up.display_name IN ('佐藤大悟', '奥田豊')
ORDER BY c.created_at DESC;

-- Phase 6: LIKE検索テスト
SELECT 
    'M&A検索テスト' as search_type,
    up.display_name,
    c.title,
    c.experience_years,
    SUBSTRING(c.career_full_text, 1, 100) || '...' as career_preview
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.career_full_text ILIKE '%M&A%' 
   OR c.skills_full_text ILIKE '%M&A%'
ORDER BY c.experience_years DESC;

SELECT 
    'フィリピン検索テスト' as search_type,
    up.display_name,
    c.title,
    SUBSTRING(c.career_full_text, 1, 100) || '...' as career_preview
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.career_full_text ILIKE '%フィリピン%'
ORDER BY c.created_at DESC;

SELECT 
    'IPO検索テスト' as search_type,
    up.display_name,
    c.title,
    SUBSTRING(c.skills_full_text, 1, 100) || '...' as skills_preview
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.career_full_text ILIKE '%IPO%' 
   OR c.skills_full_text ILIKE '%IPO%'
ORDER BY c.experience_years DESC;