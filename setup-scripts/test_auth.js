const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuth() {
  try {
    console.log('🔐 Supabase Auth Configuration Test');
    console.log('Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('');

    // 1. 基本認証システムの確認
    console.log('1. Testing basic auth system...');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('   ❌ Auth system error:', usersError.message);
        return;
      }
      
      console.log(`   ✅ Auth system working - ${users.users.length} users found`);
      
      if (users.users.length > 0) {
        console.log('   📋 Existing users:');
        users.users.forEach((user, index) => {
          console.log(`     ${index + 1}. ${user.email} (${user.email_confirmed_at ? 'confirmed' : 'unconfirmed'})`);
        });
      } else {
        console.log('   📋 No users found - you may need to create test users');
      }
    } catch (e) {
      console.log('   ❌ Auth system exception:', e.message);
      return;
    }

    // 2. RLSポリシーの確認
    console.log('\n2. Testing RLS policies...');
    try {
      // RLSポリシー一覧を取得
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('schemaname, tablename, policyname, cmd')
        .eq('schemaname', 'public');
      
      if (policies && policies.length > 0) {
        console.log('   ✅ RLS policies found:');
        const groupedPolicies = {};
        policies.forEach(policy => {
          if (!groupedPolicies[policy.tablename]) {
            groupedPolicies[policy.tablename] = [];
          }
          groupedPolicies[policy.tablename].push(`${policy.policyname} (${policy.cmd})`);
        });
        
        Object.keys(groupedPolicies).forEach(table => {
          console.log(`     ${table}: ${groupedPolicies[table].join(', ')}`);
        });
      } else {
        console.log('   ⚠️  No RLS policies found or access restricted');
      }
    } catch (e) {
      console.log('   ⚠️  RLS policy check failed:', e.message);
    }

    // 3. テーブルへのアクセステスト
    console.log('\n3. Testing table access...');
    const tables = ['cfo_profiles', 'biz_profiles', 'likes', 'reviews', 'messages', 'attachments'];
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: accessible (${data ? data.length : 0} records)`);
        }
      } catch (e) {
        console.log(`   ❌ ${tableName}: exception - ${e.message}`);
      }
    }

    // 4. 認証なしでのアクセステスト（匿名アクセス）
    console.log('\n4. Testing anonymous access (ANON key)...');
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    try {
      const { data: anonData, error: anonError } = await anonSupabase
        .from('cfo_profiles')
        .select('cfo_user_id, cfo_name, cfo_location')
        .limit(1);
      
      if (anonError) {
        console.log('   ⚠️  Anonymous access restricted (expected for RLS):', anonError.message);
      } else {
        console.log('   ✅ Anonymous read access working');
      }
    } catch (e) {
      console.log('   ⚠️  Anonymous access test failed:', e.message);
    }

    // 5. 設定確認のまとめ
    console.log('\n=== Auth Configuration Summary ===');
    console.log('✅ Next steps for testing:');
    console.log('1. Create test users via Supabase dashboard (Authentication → Users)');
    console.log('2. Test user registration/login in your app');
    console.log('3. Test profile creation (cfo_profiles/biz_profiles)');
    console.log('4. Verify RLS policies are working correctly');
    
    console.log('\n📋 Recommended test users:');
    console.log('- test-cfo@example.com (for CFO profile testing)');
    console.log('- test-company@example.com (for business profile testing)');
    
    console.log('\n🔧 If issues found:');
    console.log('- Check Authentication → Settings → Site URL');
    console.log('- Verify email confirmation settings');
    console.log('- Review RLS policies in SQL Editor');

  } catch (err) {
    console.error('\n❌ Auth test failed:', err.message);
  }
}

testAuth();