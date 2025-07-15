const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseStatus() {
  try {
    console.log('=== Database Status Check ===');
    console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('');

    // 1. 認証システムの確認
    console.log('1. Auth System:');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('   ❌ Auth Error:', authError.message);
      } else {
        console.log(`   ✅ Auth Users: ${authUsers.users.length} users`);
      }
    } catch (e) {
      console.log('   ❌ Auth Exception:', e.message);
    }

    // 2. 新アーキテクチャテーブルの確認
    console.log('\n2. New Architecture Tables:');
    const newTables = [
      'cfo_profiles', 
      'biz_profiles', 
      'likes', 
      'reviews', 
      'messages', 
      'attachments'
    ];
    
    let tablesExist = 0;
    for (const tableName of newTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: ${count || 0} records`);
          tablesExist++;
        }
      } catch (e) {
        console.log(`   ❌ ${tableName}: ${e.message}`);
      }
    }

    // 3. テーブル構造サンプル確認
    if (tablesExist > 0) {
      console.log('\n3. Table Structure Check:');
      try {
        // cfo_profilesの構造確認
        const { data: cfoSample, error: cfoError } = await supabase
          .from('cfo_profiles')
          .select('*')
          .limit(1);
        
        if (!cfoError) {
          console.log('   ✅ cfo_profiles structure accessible');
        }
        
        // biz_profilesの構造確認  
        const { data: bizSample, error: bizError } = await supabase
          .from('biz_profiles')
          .select('*')
          .limit(1);
        
        if (!bizError) {
          console.log('   ✅ biz_profiles structure accessible');
        }
      } catch (e) {
        console.log('   ❌ Structure check error:', e.message);
      }
    }

    // 4. 総合判定
    console.log('\n=== Summary ===');
    if (tablesExist === 6) {
      console.log('🎉 Database is fully set up with new architecture!');
      console.log('✅ Ready for:');
      console.log('   - User registration');
      console.log('   - Profile creation');
      console.log('   - App functionality testing');
    } else if (tablesExist > 0) {
      console.log('⚠️  Partial setup detected');
      console.log(`   ${tablesExist}/6 tables exist`);
      console.log('   May need to run setup SQL again');
    } else {
      console.log('❌ No tables found');
      console.log('   Need to run create_new_architecture.sql');
    }

  } catch (err) {
    console.error('Database check error:', err.message);
  }
}

checkDatabaseStatus();