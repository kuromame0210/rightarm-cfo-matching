// テーブル存在確認
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  try {
    // 直接 rextrix_users テーブルにアクセスしてみる
    console.log('🔍 rextrix_users テーブルアクセステスト...');
    const { data: users, error: usersError } = await supabase
      .from('rextrix_users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ rextrix_users テーブルアクセスエラー:', usersError);
      
      // rightarm_users テーブルにアクセスしてみる
      console.log('\n🔍 rightarm_users テーブルアクセステスト...');
      const { data: rightarmUsers, error: rightarmError } = await supabase
        .from('rightarm_users')
        .select('count')
        .limit(1);
      
      if (rightarmError) {
        console.error('❌ rightarm_users テーブルアクセスエラー:', rightarmError);
        console.log('\n💡 解決方法:');
        console.log('1. Supabase Dashboard で supabase-schema-fixed.sql を実行してテーブル作成');
        console.log('2. その後 migration-rightarm-to-rextrix.sql を実行してrextrixに変換');
      } else {
        console.log('✅ rightarm_users テーブルは存在します');
        console.log('💡 migration-rightarm-to-rextrix.sql を実行してrextrixテーブルに変換してください');
      }
    } else {
      console.log('✅ rextrix_users テーブルは存在します');
      console.log('データ数:', users);
    }

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

checkTables();