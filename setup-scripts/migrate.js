const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Starting Database Migration');
    console.log('Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('');

    // 1. 接続確認
    console.log('1. Testing connection...');
    const { data: connTest, error: connError } = await supabase
      .from('non_existent_table')
      .select('*')
      .limit(1);
    
    if (connError && !connError.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${connError.message}`);
    }
    console.log('   ✅ Connection OK');

    // 2. 現在のテーブル状態確認
    console.log('\n2. Checking current tables...');
    const tables = ['cfo_profiles', 'biz_profiles', 'likes', 'reviews', 'messages', 'attachments'];
    let existingTables = 0;
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`   ✅ ${table}: already exists (${count || 0} records)`);
          existingTables++;
        } else {
          console.log(`   ❌ ${table}: not found`);
        }
      } catch (e) {
        console.log(`   ❌ ${table}: error`);
      }
    }

    // 3. マイグレーション実行判定
    if (existingTables === 6) {
      console.log('\n🎉 All tables already exist! Migration not needed.');
      console.log('Database is ready for use.');
      return;
    }

    console.log(`\n3. Migration needed (${existingTables}/6 tables exist)`);
    
    // 4. SQLファイル読み込み
    const sqlFile = './setup-scripts/create_new_architecture.sql';
    if (!fs.existsSync(sqlFile)) {
      throw new Error('Migration SQL file not found: ' + sqlFile);
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('   ✅ SQL file loaded');

    // 5. SQL実行（PostgreSQL関数を使用）
    console.log('\n4. Executing migration SQL...');
    
    // 複数のSQL文を分割して実行
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      if (!sql) continue;

      try {
        // Supabaseの場合、RPC関数またはPostgREST経由でSQL実行
        const { data, error } = await supabase.rpc('exec_sql', { 
          query: sql 
        });

        if (error) {
          console.log(`   ❌ Statement ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Statement ${i + 1}: success`);
          successCount++;
        }
      } catch (e) {
        // RPC関数が存在しない場合は直接実行を試行
        console.log(`   ⚠️  Statement ${i + 1}: RPC method not available`);
      }
    }

    // 6. 最終確認
    console.log('\n5. Verifying migration...');
    let finalCount = 0;
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`   ✅ ${table}: verified`);
          finalCount++;
        }
      } catch (e) {
        console.log(`   ❌ ${table}: verification failed`);
      }
    }

    // 7. 結果報告
    console.log('\n=== Migration Results ===');
    if (finalCount === 6) {
      console.log('🎉 Migration completed successfully!');
      console.log('✅ All 6 tables created and verified');
      console.log('\nReady for:');
      console.log('- User registration');
      console.log('- Profile creation');
      console.log('- App functionality testing');
    } else {
      console.log('⚠️  Migration partially completed');
      console.log(`   ${finalCount}/6 tables verified`);
      console.log('\n📋 Manual Steps Required:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor → New Query');
      console.log('4. Copy content from setup-scripts/create_new_architecture.sql');
      console.log('5. Click Run');
    }

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.log('\n💡 Try manual execution via Supabase SQL Editor');
  }
}

// マイグレーション実行
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };