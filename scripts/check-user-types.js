const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTypes() {
  console.log('🔍 ユーザータイプの実際の値を調査\n');

  // 1. 全ユーザーのuser_typeを確認
  console.log('📊 全ユーザーのuser_type値:');
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('id, email, name, user_type')
    .order('created_at');

  if (allError) {
    console.log('エラー:', allError.message);
    return;
  }

  console.log(`全ユーザー数: ${allUsers?.length || 0}件\n`);

  allUsers?.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}:`);
    console.log(`   name: "${user.name}"`);
    console.log(`   user_type: "${user.user_type}" (型: ${typeof user.user_type})`);
    console.log(`   厳密比較: user_type === "cfo" → ${user.user_type === "cfo"}`);
    console.log(`   厳密比較: user_type === "company" → ${user.user_type === "company"}`);
    console.log('');
  });

  // 2. user_typeの種類を集計
  console.log('📈 user_type値の種類と件数:');
  const userTypeCounts = {};
  allUsers?.forEach(user => {
    const userType = user.user_type;
    const key = userType === null ? 'NULL' : userType === undefined ? 'UNDEFINED' : `"${userType}"`;
    userTypeCounts[key] = (userTypeCounts[key] || 0) + 1;
  });

  Object.entries(userTypeCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}件`);
  });

  // 3. CFOプロフィールを持つユーザーのuser_type確認
  console.log('\n🎯 CFOプロフィールを持つユーザーのuser_type:');
  const { data: cfoUsers, error: cfoError } = await supabase
    .from('users')
    .select('id, email, name, user_type')
    .in('id', 
      await supabase
        .from('cfo_profiles')
        .select('cfo_user_id')
        .then(res => res.data?.map(p => p.cfo_user_id) || [])
    );

  if (cfoError) {
    console.log('CFOユーザー取得エラー:', cfoError.message);
  } else {
    cfoUsers?.forEach(user => {
      console.log(`- ${user.email}: user_type="${user.user_type}"`);
      if (user.user_type !== 'cfo') {
        console.log(`  ⚠️  CFOプロフィールがあるのにuser_typeが"${user.user_type}"`);
      }
    });
  }

  // 4. 企業プロフィールを持つユーザーのuser_type確認
  console.log('\n🏢 企業プロフィールを持つユーザーのuser_type:');
  const { data: companyUsers, error: companyError } = await supabase
    .from('users')
    .select('id, email, name, user_type')
    .in('id', 
      await supabase
        .from('company_profiles')
        .select('company_user_id')
        .then(res => res.data?.map(p => p.company_user_id) || [])
    );

  if (companyError) {
    console.log('企業ユーザー取得エラー:', companyError.message);
  } else {
    companyUsers?.forEach(user => {
      console.log(`- ${user.email}: user_type="${user.user_type}"`);
      if (user.user_type !== 'company') {
        console.log(`  ⚠️  企業プロフィールがあるのにuser_typeが"${user.user_type}"`);
      }
    });
  }

  console.log('\n📋 問題の特定:');
  const problematicUsers = allUsers?.filter(user => 
    user.user_type !== 'cfo' && user.user_type !== 'company'
  ) || [];
  
  if (problematicUsers.length > 0) {
    console.log(`⚠️  問題のあるuser_type値: ${problematicUsers.length}件`);
    problematicUsers.forEach(user => {
      console.log(`  - ${user.email}: "${user.user_type}"`);
    });
  } else {
    console.log('✅ 全ユーザーのuser_typeは正常（"cfo" または "company"）');
  }
}

// 実行
checkUserTypes().catch(console.error);