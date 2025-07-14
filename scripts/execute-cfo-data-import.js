// CFOデータインポート実行スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importCfoData() {
  try {
    console.log('\n=== Phase 1: 佐藤大悟さんのデータ投入 ===');
    
    // 佐藤大悟さんのユーザー確認・作成
    let { data: dai88User, error: dai88UserError } = await supabase
      .from('rextrix_users')
      .select('id')
      .eq('email', 'dai88@example.com')
      .single();

    let dai88UserId;
    if (dai88UserError && dai88UserError.code === 'PGRST116') {
      // ユーザーが存在しない場合は作成
      const { data: newUser, error: createUserError } = await supabase
        .from('rextrix_users')
        .insert({
          email: 'dai88@example.com',
          user_type: 'cfo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createUserError) {
        console.error('佐藤大悟さんのユーザー作成エラー:', createUserError);
        return;
      }
      dai88UserId = newUser.id;
      console.log('✅ 佐藤大悟さんのユーザー新規作成:', dai88UserId);
    } else if (dai88UserError) {
      console.error('佐藤大悟さんのユーザー取得エラー:', dai88UserError);
      return;
    } else {
      dai88UserId = dai88User.id;
      console.log('✅ 佐藤大悟さんの既存ユーザー使用:', dai88UserId);
    }

    // 佐藤大悟さんのプロフィール投入
    const { error: dai88ProfileError } = await supabase
      .from('rextrix_user_profiles')
      .update({
        display_name: '佐藤大悟',
        phone_number: null,
        region: '千葉県千葉市',
        introduction: 'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。今まで7つの事業を行ってきました。2つはM&Aで売却しました。フィリピン・セブ島で複数のビジネスを行い、特に不動産開発を華僑の仲間達と行いました。現在、開発した投資用ホテルは順調にホテルオペレーションが行われています。USでの投資銀行オーナー達と強いつながりがあるため、日系企業のUSでの上場サポートも行っていけます。',
        work_preference: '応相談（臨機応変に対応致します）',
        compensation_range: '月10万円〜、成果報酬応相談',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', dai88UserId);

    if (dai88ProfileError) {
      console.error('佐藤大悟さんのプロフィール更新エラー:', dai88ProfileError);
      return;
    }
    console.log('✅ 佐藤大悟さんのプロフィール更新完了');

    // 佐藤大悟さんのCFOプロフィール投入
    const { error: dai88CfoError } = await supabase
      .from('rextrix_cfos')
      .update({
        title: 'クロスボーダーM&A・海外事業・USアップサポート専門家',
        experience_years: 23,
        experience_summary: `2001,03 明治大学法学部法律学科卒業

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
【保有資格】特に無し`,
        specialties: ["海外業務", "英語業務", "US上場サポート", "IPOサポート", "投資銀行紹介", "弁護士事務所紹介", "監査法人紹介", "投資案件発掘", "不動産コンサルティング", "ビジネスコンサルティング", "通訳", "翻訳", "ビジネス通訳", "交渉", "M&A支援", "クロスボーダーM&A", "資金調達支援", "フィリピン事業", "セブ島事業", "不動産開発", "ホテル開発", "語学学校運営", "テニススクール", "EC事業", "高麗人参販売"],
        is_available: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', dai88UserId);

    if (dai88CfoError) {
      console.error('佐藤大悟さんのCFO詳細プロフィール更新エラー:', dai88CfoError);
      return;
    }
    console.log('✅ 佐藤大悟さんのCFO詳細プロフィール更新完了');

    console.log('\n=== Phase 2: 奥田豊さんのデータ投入 ===');
    
    // 奥田豊さんのユーザー確認・作成
    let { data: okudaUser, error: okudaUserError } = await supabase
      .from('rextrix_users')
      .select('id')
      .eq('email', 'okuda@example.com')
      .single();

    let okudaUserId;
    if (okudaUserError && okudaUserError.code === 'PGRST116') {
      // ユーザーが存在しない場合は作成
      const { data: newUser, error: createUserError } = await supabase
        .from('rextrix_users')
        .insert({
          email: 'okuda@example.com',
          user_type: 'cfo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createUserError) {
        console.error('奥田豊さんのユーザー作成エラー:', createUserError);
        return;
      }
      okudaUserId = newUser.id;
      console.log('✅ 奥田豊さんのユーザー新規作成:', okudaUserId);
    } else if (okudaUserError) {
      console.error('奥田豊さんのユーザー取得エラー:', okudaUserError);
      return;
    } else {
      okudaUserId = okudaUser.id;
      console.log('✅ 奥田豊さんの既存ユーザー使用:', okudaUserId);
    }

    // 奥田豊さんのプロフィール投入
    const { error: okudaProfileError } = await supabase
      .from('rextrix_user_profiles')
      .update({
        display_name: '奥田豊',
        phone_number: null,
        region: '奈良県生駒市',
        introduction: '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
        work_preference: '週２日・10時から18時',
        compensation_range: '成果報酬応相談、5,000円/h以上',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', okudaUserId);

    if (okudaProfileError) {
      console.error('奥田豊さんのプロフィール更新エラー:', okudaProfileError);
      return;
    }
    console.log('✅ 奥田豊さんのプロフィール更新完了');

    // 奥田豊さんのCFOプロフィール投入
    const { error: okudaCfoError } = await supabase
      .from('rextrix_cfos')
      .update({
        title: 'IPO達成経験・銀行出身・中小企業診断士',
        experience_years: 18,
        experience_summary: `2006年〜2008年:株式会社りそな銀行で法人融資業務
2008年〜2016年:日本発条株式会社で本社経理及び工場経理業務
2016年～2024年：エスネットワークス株式会社で財務コンサル及び（管理部）経理部門長業務

【対応可能エリア】全国リモートOK、大阪近郊は対面可
【保有資格】中小企業診断士、日商簿記１級`,
        specialties: ["IPO支援", "IPO準備", "IPO達成", "事業計画策定", "資金調達", "融資業務", "法人融資", "M&A支援", "管理会計導入", "PMI支援", "補助金申請", "銀行業務", "経理業務", "財務コンサル", "経理部門長", "本社経理", "工場経理", "中小企業診断士", "簿記1級", "製造業経理", "IT企業財務", "事業会社経験", "銀行経験"],
        is_available: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', okudaUserId);

    if (okudaCfoError) {
      console.error('奥田豊さんのCFO詳細プロフィール更新エラー:', okudaCfoError);
      return;
    }
    console.log('✅ 奥田豊さんのCFO詳細プロフィール更新完了');

    console.log('\n=== Phase 3: データ投入結果の検証 ===');

    // 投入データ確認
    const { data: updatedProfiles, error: profilesError } = await supabase
      .from('rextrix_users')
      .select(`
        email,
        rextrix_user_profiles (
          display_name,
          region,
          work_preference,
          compensation_range,
          introduction
        )
      `)
      .in('email', ['dai88@example.com', 'okuda@example.com']);

    if (profilesError) {
      console.error('プロフィール確認エラー:', profilesError);
    } else {
      console.log('\n更新されたプロフィール:');
      updatedProfiles.forEach(user => {
        const profile = user.rextrix_user_profiles[0];
        console.log(`\n--- ${user.email} ---`);
        console.log('表示名:', profile?.display_name);
        console.log('地域:', profile?.region);
        console.log('働き方:', profile?.work_preference);
        console.log('報酬:', profile?.compensation_range);
        console.log('自己紹介文字数:', profile?.introduction?.length || 0);
      });
    }

    // CFOデータ確認
    const { data: updatedCfos, error: cfosError } = await supabase
      .from('rextrix_users')
      .select(`
        email,
        rextrix_cfos (
          title,
          experience_years,
          experience_summary,
          specialties,
          is_available
        )
      `)
      .in('email', ['dai88@example.com', 'okuda@example.com']);

    if (cfosError) {
      console.error('CFOデータ確認エラー:', cfosError);
    } else {
      console.log('\n更新されたCFOデータ:');
      updatedCfos.forEach(user => {
        const cfo = user.rextrix_cfos[0];
        console.log(`\n--- ${user.email} ---`);
        console.log('タイトル:', cfo?.title);
        console.log('経験年数:', cfo?.experience_years);
        console.log('経歴要約文字数:', cfo?.experience_summary?.length || 0);
        console.log('専門分野数:', cfo?.specialties?.length || 0);
        console.log('専門分野:', cfo?.specialties?.slice(0, 5).join(', ') + (cfo?.specialties?.length > 5 ? '...' : ''));
        console.log('対応可能:', cfo?.is_available);
      });
    }

    // JSONB検索テスト
    console.log('\n=== Phase 4: JSONB検索機能テスト ===');

    // M&A検索テスト
    const { data: maResults, error: maError } = await supabase
      .from('rextrix_cfos')
      .select(`
        rextrix_user_profiles!inner(display_name),
        title,
        specialties
      `)
      .contains('specialties', ['M&A支援']);

    if (maError) {
      console.error('M&A検索エラー:', maError);
    } else {
      console.log('\nM&A支援スキル保有者:');
      maResults.forEach(result => {
        console.log(`- ${result.rextrix_user_profiles.display_name}: ${result.title}`);
      });
    }

    // IPO検索テスト
    const { data: ipoResults, error: ipoError } = await supabase
      .from('rextrix_cfos')
      .select(`
        rextrix_user_profiles!inner(display_name),
        title,
        specialties
      `)
      .contains('specialties', ['IPO支援']);

    if (ipoError) {
      console.error('IPO検索エラー:', ipoError);
    } else {
      console.log('\nIPO支援スキル保有者:');
      ipoResults.forEach(result => {
        console.log(`- ${result.rextrix_user_profiles.display_name}: ${result.title}`);
      });
    }

    // フィリピン検索テスト
    const { data: philippinesResults, error: philippinesError } = await supabase
      .from('rextrix_cfos')
      .select(`
        rextrix_user_profiles!inner(display_name),
        title,
        specialties
      `)
      .contains('specialties', ['フィリピン事業']);

    if (philippinesError) {
      console.error('フィリピン検索エラー:', philippinesError);
    } else {
      console.log('\nフィリピン事業スキル保有者:');
      philippinesResults.forEach(result => {
        console.log(`- ${result.rextrix_user_profiles.display_name}: ${result.title}`);
      });
    }

    console.log('\n✅ JSONB配列対応版データ投入・検証完了');

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

importCfoData();