const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL() {
  try {
    console.log('🚀 Automated SQL Execution Test');
    console.log('Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('');

    // 1. 現在の状態確認
    console.log('1. Current state verification...');
    const { data: testData, error: testError } = await supabase
      .from('cfo_profiles')
      .select('*')
      .limit(1);
    
    if (testError && testError.message.includes('does not exist')) {
      console.log('   ✅ Confirmed: Tables do not exist - proceeding with creation');
    } else if (!testError) {
      console.log('   ⚠️  Tables already exist - skipping creation');
      return;
    }

    // 2. SQL実行方法の検証
    console.log('\n2. Testing SQL execution methods...');
    
    // Method 1: 単純なテーブル作成テスト
    console.log('   Method 1: Simple CREATE TABLE test');
    try {
      const testSQL = `
        CREATE TABLE IF NOT EXISTS test_table_temp (
          id serial PRIMARY KEY,
          name text,
          created_at timestamptz DEFAULT now()
        );
      `;
      
      // Supabaseでの直接SQL実行を試行
      const { data: sqlResult1, error: sqlError1 } = await supabase.rpc('sql', { 
        query: testSQL 
      });
      
      if (sqlError1) {
        console.log('     ❌ RPC sql function not available:', sqlError1.message);
      } else {
        console.log('     ✅ RPC sql function works');
      }
    } catch (e) {
      console.log('     ❌ RPC method failed:', e.message);
    }
    
    // Method 2: PostgreSQL関数経由
    console.log('   Method 2: PostgreSQL function execution');
    try {
      const { data: dbExecResult, error: dbExecError } = await supabase.rpc('exec_sql', {
        sql_query: 'SELECT 1 as test'
      });
      
      if (dbExecError) {
        console.log('     ❌ exec_sql function not available:', dbExecError.message);
      } else {
        console.log('     ✅ exec_sql function works');
      }
    } catch (e) {
      console.log('     ❌ exec_sql method failed:', e.message);
    }

    // Method 3: REST API経由での直接実行
    console.log('   Method 3: Raw SQL execution attempt');
    try {
      // テスト用の簡単なENUM作成
      const simpleSQL = "CREATE TYPE IF NOT EXISTS test_enum AS ENUM ('test');";
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({ sql: simpleSQL })
      });
      
      if (response.ok) {
        console.log('     ✅ REST API method works');
      } else {
        console.log('     ❌ REST API method failed:', response.status);
      }
    } catch (e) {
      console.log('     ❌ REST API method exception:', e.message);
    }

    // 3. 実際のテーブル作成実行
    console.log('\n3. Attempting actual table creation...');
    
    // SQLファイルを読み込み
    const sqlFile = './setup-scripts/create_new_architecture.sql';
    if (!fs.existsSync(sqlFile)) {
      throw new Error('SQL file not found: ' + sqlFile);
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('   ✅ SQL file loaded');

    // SQL文を分割
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 10);

    console.log(`   Found ${sqlStatements.length} SQL statements`);

    // 個別実行を試行
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < Math.min(sqlStatements.length, 3); i++) { // 最初の3文だけテスト
      const sql = sqlStatements[i];
      console.log(`\n   Executing statement ${i + 1}...`);
      console.log(`   SQL: ${sql.substring(0, 50)}...`);
      
      try {
        // 複数の方法を試行
        let executed = false;
        
        // Try method 1: RPC
        try {
          const { data, error } = await supabase.rpc('sql', { query: sql });
          if (!error) {
            console.log(`     ✅ Success with RPC method`);
            successCount++;
            executed = true;
          } else {
            console.log(`     ❌ RPC error: ${error.message}`);
          }
        } catch (e) {
          console.log(`     ❌ RPC exception: ${e.message}`);
        }
        
        if (!executed) {
          errorCount++;
          errors.push(`Statement ${i + 1}: No working execution method`);
        }
        
      } catch (e) {
        console.log(`     ❌ Statement ${i + 1} failed: ${e.message}`);
        errorCount++;
        errors.push(`Statement ${i + 1}: ${e.message}`);
      }
    }

    // 4. 結果レポート
    console.log('\n=== Execution Results ===');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    // 5. 最終確認
    console.log('\n4. Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('cfo_profiles')
      .select('*')
      .limit(1);
    
    if (finalError && finalError.message.includes('does not exist')) {
      console.log('   ❌ Tables still do not exist');
      console.log('\n📋 Conclusion: Automatic SQL execution is LIMITED');
      console.log('   - Supabase restricts direct SQL execution via API');
      console.log('   - Manual execution via SQL Editor is required');
      console.log('   - This is a Supabase platform limitation, not our code issue');
    } else if (!finalError) {
      console.log('   ✅ Tables successfully created!');
      console.log('\n🎉 Conclusion: Automatic SQL execution SUCCESSFUL');
    }

  } catch (err) {
    console.error('\n❌ SQL execution failed:', err.message);
    console.log('\n📋 Conclusion: Manual SQL execution required');
    console.log('   Please use Supabase SQL Editor to run the migration');
  }
}

executeSQL();