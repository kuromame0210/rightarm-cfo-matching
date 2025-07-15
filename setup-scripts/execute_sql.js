const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL() {
  try {
    console.log('=== Executing New Architecture SQL ===');
    
    // SQLファイルを読み込み
    const sqlContent = fs.readFileSync('create_new_architecture.sql', 'utf8');
    
    // まず直接実行を試行
    console.log('Attempting direct SQL execution...');
    
    // PostgreSQL raw query実行
    const { data, error } = await supabase
      .from('_any_table_') // ダミー
      .select('1')
      .limit(0);
    
    if (error) {
      console.log('Direct execution not available, using alternative method...');
    }
    
    // 代替手段：個別にテーブル作成を確認
    console.log('\n=== Testing table creation manually ===');
    
    // ENUM型の作成テスト
    try {
      const { data, error } = await supabase
        .from('cfo_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error && error.message.includes('relation "cfo_profiles" does not exist')) {
        console.log('❌ Tables not created yet - manual SQL execution required');
        console.log('\n📋 Manual Steps Required:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to SQL Editor → New Query');
        console.log('4. Copy and paste the content from create_new_architecture.sql');
        console.log('5. Click Run');
      } else if (!error) {
        console.log('✅ Tables already exist!');
        await testTables();
      }
    } catch (e) {
      console.log('Table check error:', e.message);
    }
    
  } catch (err) {
    console.error('Setup error:', err.message);
  }
}

async function testTables() {
  console.log('\n=== Testing New Architecture Tables ===');
  
  const newTables = ['cfo_profiles', 'biz_profiles', 'likes', 'reviews', 'messages', 'attachments'];
  
  for (const tableName of newTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: ${count || 0} records`);
      }
    } catch (e) {
      console.log(`❌ ${tableName}: ${e.message}`);
    }
  }
}

executeSQL();