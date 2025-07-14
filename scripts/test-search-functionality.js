// 検索機能テストスクリプト
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

async function testSearchFunctionality() {
  try {
    console.log('\n=== JSONB検索機能テスト（正しい構文） ===');

    // M&A検索テスト（正しいPostgreSQLのJSONB演算子使用）
    console.log('\n1. M&A支援スキル検索:');
    const { data: maResults, error: maError } = await supabase
      .rpc('search_cfos_by_specialty', { search_term: 'M&A支援' });

    if (maError) {
      // RPCが存在しない場合は直接クエリ
      console.log('RPC関数が存在しないため、直接検索を試行...');
      
      // 代替方法: ILIKEを使用したテキスト検索
      const { data: maAltResults, error: maAltError } = await supabase
        .from('rextrix_cfos')
        .select(`
          title,
          experience_summary,
          rextrix_users!inner(
            email,
            rextrix_user_profiles(display_name)
          )
        `)
        .or('experience_summary.ilike.%M&A%,title.ilike.%M&A%');

      if (maAltError) {
        console.error('M&A代替検索エラー:', maAltError);
      } else {
        console.log('M&A関連CFO:');
        maAltResults.forEach(result => {
          const profileName = result.rextrix_users.rextrix_user_profiles[0]?.display_name || '不明';
          console.log(`- ${profileName} (${result.rextrix_users.email}): ${result.title}`);
        });
      }
    }

    // IPO検索テスト
    console.log('\n2. IPO支援スキル検索:');
    const { data: ipoResults, error: ipoError } = await supabase
      .from('rextrix_cfos')
      .select(`
        title,
        experience_summary,
        rextrix_users!inner(
          email,
          rextrix_user_profiles(display_name)
        )
      `)
      .or('experience_summary.ilike.%IPO%,title.ilike.%IPO%');

    if (ipoError) {
      console.error('IPO検索エラー:', ipoError);
    } else {
      console.log('IPO関連CFO:');
      ipoResults.forEach(result => {
        const profileName = result.rextrix_users.rextrix_user_profiles[0]?.display_name || '不明';
        console.log(`- ${profileName} (${result.rextrix_users.email}): ${result.title}`);
      });
    }

    // フィリピン検索テスト
    console.log('\n3. フィリピン事業スキル検索:');
    const { data: philippinesResults, error: philippinesError } = await supabase
      .from('rextrix_cfos')
      .select(`
        title,
        experience_summary,
        rextrix_users!inner(
          email,
          rextrix_user_profiles(display_name)
        )
      `)
      .or('experience_summary.ilike.%フィリピン%,title.ilike.%フィリピン%');

    if (philippinesError) {
      console.error('フィリピン検索エラー:', philippinesError);
    } else {
      console.log('フィリピン関連CFO:');
      philippinesResults.forEach(result => {
        const profileName = result.rextrix_users.rextrix_user_profiles[0]?.display_name || '不明';
        console.log(`- ${profileName} (${result.rextrix_users.email}): ${result.title}`);
      });
    }

    // specialties配列の中身を直接確認
    console.log('\n4. specialties配列の中身確認:');
    const { data: specialtiesCheck, error: specialtiesError } = await supabase
      .from('rextrix_cfos')
      .select(`
        specialties,
        rextrix_users!inner(
          email,
          rextrix_user_profiles(display_name)
        )
      `)
      .in('rextrix_users.email', ['dai88@example.com', 'okuda@example.com']);

    if (specialtiesError) {
      console.error('specialties確認エラー:', specialtiesError);
    } else {
      specialtiesCheck.forEach(result => {
        const profileName = result.rextrix_users.rextrix_user_profiles[0]?.display_name || '不明';
        console.log(`\n${profileName} (${result.rextrix_users.email})の専門分野:`);
        if (Array.isArray(result.specialties)) {
          result.specialties.forEach((specialty, index) => {
            console.log(`  ${index + 1}. ${specialty}`);
          });
        } else {
          console.log('  specialtiesが配列ではありません:', typeof result.specialties, result.specialties);
        }
      });
    }

    console.log('\n✅ 検索機能テスト完了');

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

testSearchFunctionality();