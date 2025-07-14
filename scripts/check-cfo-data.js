// CFOプロフィールデータ確認スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCFOProfiles() {
  console.log('=== CFOプロフィールデータの確認開始 ===\n');

  try {
    // 1. 全CFOユーザーの取得
    console.log('1. 全CFOユーザーの情報を取得...');
    const { data: cfoUsers, error: cfoError } = await supabase
      .from('rextrix_users')
      .select(`
        id,
        email,
        user_type,
        status,
        created_at,
        rextrix_user_profiles(
          display_name,
          nickname,
          introduction,
          phone_number,
          region,
          work_preference,
          compensation_range
        ),
        rextrix_cfos(
          experience_years,
          experience_summary,
          achievements,
          certifications,
          is_available,
          max_concurrent_projects,
          rating,
          review_count
        )
      `)
      .eq('user_type', 'cfo')
      .order('created_at', { ascending: false });

    if (cfoError) {
      console.error('CFOユーザー取得エラー:', cfoError);
      return;
    }

    console.log(`CFOユーザー数: ${cfoUsers?.length || 0}`);
    
    if (cfoUsers && cfoUsers.length > 0) {
      cfoUsers.forEach((user, index) => {
        console.log(`\n--- CFO ${index + 1} ---`);
        console.log('ユーザーID:', user.id);
        console.log('メール:', user.email);
        console.log('ステータス:', user.status);
        console.log('作成日:', user.created_at);
        
        if (user.rextrix_user_profiles && user.rextrix_user_profiles.length > 0) {
          const profile = user.rextrix_user_profiles[0];
          console.log('表示名:', profile.display_name);
          console.log('ニックネーム:', profile.nickname);
          console.log('自己紹介:', profile.introduction);
          console.log('電話番号:', profile.phone_number);
          console.log('地域:', profile.region);
          console.log('勤務形態:', profile.work_preference);
          console.log('報酬範囲:', profile.compensation_range);
        } else {
          console.log('プロフィール情報: なし');
        }

        if (user.rextrix_cfos && user.rextrix_cfos.length > 0) {
          const cfo = user.rextrix_cfos[0];
          console.log('経験年数:', cfo.experience_years);
          console.log('経験要約:', cfo.experience_summary);
          console.log('実績:', cfo.achievements);
          console.log('資格:', cfo.certifications);
          console.log('利用可能:', cfo.is_available);
        } else {
          console.log('CFO詳細情報: なし');
        }
      });
    }

    // 2. 佐藤大悟さんと奥田豊さんの特定検索
    console.log('\n\n2. 佐藤大悟さんと奥田豊さんの特定検索...');
    const { data: specificUsers, error: specificError } = await supabase
      .from('rextrix_users')
      .select(`
        id,
        email,
        rextrix_user_profiles(display_name, region, work_preference, compensation_range, introduction),
        rextrix_cfos(experience_summary, achievements, certifications)
      `)
      .eq('user_type', 'cfo');

    if (specificError) {
      console.error('特定検索エラー:', specificError);
      return;
    }

    // 名前で絞り込み
    const targetUsers = specificUsers?.filter(user => {
      const profile = user.rextrix_user_profiles?.[0];
      const name = profile?.display_name || '';
      return name.includes('佐藤') || name.includes('大悟') || 
             name.includes('奥田') || name.includes('豊') ||
             user.email.includes('dai88') || user.email.includes('okuda');
    });

    if (targetUsers && targetUsers.length > 0) {
      console.log(`対象ユーザー発見: ${targetUsers.length}件`);
      targetUsers.forEach((user, index) => {
        console.log(`\n=== 対象ユーザー ${index + 1} ===`);
        console.log('メール:', user.email);
        const profile = user.rextrix_user_profiles?.[0];
        const cfo = user.rextrix_cfos?.[0];
        
        if (profile) {
          console.log('名前:', profile.display_name);
          console.log('地域:', profile.region);
          console.log('勤務形態:', profile.work_preference);
          console.log('報酬:', profile.compensation_range);
          console.log('紹介文:', profile.introduction);
        }
        
        if (cfo) {
          console.log('経験要約:', cfo.experience_summary);
          console.log('実績:', cfo.achievements);
          console.log('資格:', cfo.certifications);
        }
      });
    } else {
      console.log('佐藤大悟さんまたは奥田豊さんのデータが見つかりませんでした。');
    }

    // 3. テーブル構造の確認
    console.log('\n\n3. テーブル構造の確認...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .like('table_name', '%cfo%')
      .or('table_name.like.%user%,table_name.like.%profile%');

    if (!tablesError && tables) {
      console.log('関連テーブル:');
      tables.forEach(table => {
        console.log(`- ${table.table_name} (${table.table_type})`);
      });
    }

  } catch (error) {
    console.error('実行エラー:', error);
  }
}

// スクリプト実行
checkCFOProfiles().then(() => {
  console.log('\n=== CFOプロフィールデータの確認完了 ===');
  process.exit(0);
}).catch(error => {
  console.error('スクリプト実行エラー:', error);
  process.exit(1);
});