const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function correctTableCheck() {
  try {
    console.log('=== Correct Table Existence Check ===');
    
    const tables = ['cfo_profiles', 'biz_profiles', 'likes', 'reviews', 'messages', 'attachments'];
    let existingTables = 0;
    
    for (const tableName of tables) {
      try {
        // 正しい方法: SELECT リクエストでエラーチェック
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          console.log(`❌ ${tableName}: Table does not exist`);
        } else if (error) {
          console.log(`⚠️  ${tableName}: Other error - ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Table exists (${data ? data.length : 0} records)`);
          existingTables++;
        }
      } catch (e) {
        console.log(`❌ ${tableName}: Exception - ${e.message}`);
      }
    }
    
    console.log(`\n=== Correct Result ===`);
    console.log(`Actually existing tables: ${existingTables}/6`);
    
    if (existingTables === 0) {
      console.log('✅ Confirmed: No tables exist - SQL execution needed');
    } else if (existingTables === 6) {
      console.log('✅ Confirmed: All tables exist - ready for use');
    } else {
      console.log('⚠️  Partial setup detected - migration incomplete');
    }

    console.log('\n=== Why Previous Check Failed ===');
    console.log('❌ head: true + count: exact returns null for non-existent tables');
    console.log('❌ error: null for non-existent tables with HEAD requests');
    console.log('✅ SELECT requests properly return "does not exist" errors');
    console.log('✅ This is the reliable method for table existence checking');

  } catch (err) {
    console.error('Check error:', err.message);
  }
}

correctTableCheck();