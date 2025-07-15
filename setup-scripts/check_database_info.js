const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseInfo() {
  try {
    console.log('=== Database Information Check ===');
    console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Project ID:', process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]);
    console.log('');

    // Supabaseでは通常データベース名は "postgres"
    console.log('1. Database Information:');
    console.log('   Database name: postgres (Supabase default)');
    console.log('   Schema: public (default for user tables)');
    console.log('');

    // publicスキーマのテーブル一覧
    console.log('2. Checking Tables in public schema:');
    
    const testTables = ['cfo_profiles', 'biz_profiles', 'likes', 'reviews', 'messages', 'attachments'];
    let existingTables = 0;
    
    for (const tableName of testTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`   ❌ ${tableName}: Table does not exist`);
          } else {
            console.log(`   ⚠️  ${tableName}: ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${tableName}: EXISTS (${data ? data.length : 0} records)`);
          existingTables++;
        }
      } catch (e) {
        console.log(`   ❌ ${tableName}: Exception - ${e.message}`);
      }
    }

    // Supabase認証テーブルもチェック
    console.log('\n3. Supabase System Tables:');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (!authError) {
        console.log(`   ✅ auth.users: ${authUsers.users.length} users`);
      } else {
        console.log(`   ❌ auth.users: ${authError.message}`);
      }
    } catch (e) {
      console.log(`   ❌ auth.users: ${e.message}`);
    }

    console.log('\n=== Diagnosis ===');
    if (existingTables === 6) {
      console.log('🎯 Tables exist in API but not visible in dashboard');
      console.log('\nPossible causes:');
      console.log('1. Dashboard cache issue - try refreshing');
      console.log('2. Viewing wrong project - check project ID');
      console.log('3. RLS policies hiding tables - check permissions');
      console.log('4. Dashboard UI bug - try different browser');
      
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Verify project URL in dashboard matches:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('2. Go to Database → Tables (not Table Editor)');
      console.log('3. Try SQL Editor: SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';');
      console.log('4. Check if tables are in different schema');
      
    } else if (existingTables === 0) {
      console.log('❌ No tables found - API connection might be wrong');
      console.log('\nTroubleshooting:');
      console.log('1. Check .env.test has correct credentials');
      console.log('2. Run migration: node setup-scripts/migrate.js');
      console.log('3. Manual SQL execution required');
    } else {
      console.log(`⚠️  Partial tables found: ${existingTables}/6`);
      console.log('Migration may be incomplete');
    }

  } catch (err) {
    console.error('Database info error:', err.message);
  }
}

checkDatabaseInfo();