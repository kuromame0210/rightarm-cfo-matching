const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAPIResponses() {
  try {
    console.log('=== API Response Analysis ===');
    console.log('Investigating why API returned false positives for table existence\n');

    // 1. 明らかに存在しないテーブルのテスト
    console.log('1. Testing obviously non-existent table:');
    try {
      const { data, error, count } = await supabase
        .from('definitely_does_not_exist_table_12345')
        .select('*', { count: 'exact', head: true });
      
      console.log('   Response for non-existent table:');
      console.log('   - data:', data);
      console.log('   - error:', error ? error.message : 'null');
      console.log('   - count:', count);
      console.log('   - error code:', error ? error.code : 'null');
    } catch (e) {
      console.log('   Exception:', e.message);
    }

    // 2. 新アーキテクチャテーブルの詳細テスト
    console.log('\n2. Testing new architecture tables (detailed):');
    const tables = ['cfo_profiles', 'biz_profiles', 'likes'];
    
    for (const tableName of tables) {
      console.log(`\n   Testing ${tableName}:`);
      
      try {
        // head: true でのテスト
        const headResult = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        console.log(`     HEAD request - data: ${headResult.data}, error: ${headResult.error ? headResult.error.message : 'null'}, count: ${headResult.count}`);
        
        // 通常のselect
        const selectResult = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        console.log(`     SELECT request - data: ${selectResult.data ? selectResult.data.length : 'null'}, error: ${selectResult.error ? selectResult.error.message : 'null'}`);
        
        // count専用
        const countResult = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        console.log(`     COUNT request - count: ${countResult.count}, error: ${countResult.error ? countResult.error.message : 'null'}`);
        
      } catch (e) {
        console.log(`     Exception: ${e.message}`);
      }
    }

    // 3. 実際に存在するauth.usersテーブルとの比較
    console.log('\n3. Testing actually existing auth.users table:');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      console.log('   auth.users via admin API:');
      console.log('   - users count:', authUsers ? authUsers.users.length : 'null');
      console.log('   - error:', authError ? authError.message : 'null');
    } catch (e) {
      console.log('   Exception:', e.message);
    }

    // 4. PostgREST のスキーマ情報確認
    console.log('\n4. Testing schema information access:');
    try {
      const schemaResult = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      console.log('   information_schema.tables:');
      console.log('   - data:', schemaResult.data);
      console.log('   - error:', schemaResult.error ? schemaResult.error.message : 'null');
    } catch (e) {
      console.log('   Exception:', e.message);
    }

    console.log('\n=== Analysis ===');
    console.log('Possible reasons for false positive:');
    console.log('1. Supabase PostgREST returns success even for non-existent tables');
    console.log('2. RLS policies might affect response format');
    console.log('3. head: true might behave differently than expected');
    console.log('4. Service role key might have different behavior');
    console.log('5. Our error checking logic might be flawed');

  } catch (err) {
    console.error('Debug error:', err.message);
  }
}

debugAPIResponses();