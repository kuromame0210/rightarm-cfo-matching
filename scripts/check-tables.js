const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 データベーステーブル構造の調査\n');

  // 1. 利用可能なテーブルを確認
  console.log('📊 利用可能なテーブル一覧:');
  
  const tables = [
    'users', 'cfo_profiles', 'company_profiles', 
    'user_profiles', 'profiles', 'auth.users'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`✅ ${table}: 存在 (サンプル列: ${Object.keys(data[0] || {}).join(', ')})`);
      }
    } catch (err) {
      console.log(`❌ ${table}: 存在しない`);
    }
  }

  // 2. CFOプロフィールから実際のユーザー情報を取得
  console.log('\n🎯 CFOプロフィールのユーザー情報:');
  try {
    const { data: cfoProfiles, error: cfoError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name, cfo_email')
      .limit(10);

    if (!cfoError && cfoProfiles) {
      console.log(`CFOプロフィール数: ${cfoProfiles.length}件`);
      cfoProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.cfo_user_id}, 名前: ${profile.cfo_name}, Email: ${profile.cfo_email}`);
      });
    }
  } catch (err) {
    console.log('CFOプロフィール取得エラー:', err.message);
  }

  // 3. 企業プロフィールから実際のユーザー情報を取得
  console.log('\n🏢 企業プロフィールのユーザー情報:');
  try {
    const { data: companyProfiles, error: companyError } = await supabase
      .from('company_profiles')
      .select('company_user_id, company_name, company_email')
      .limit(10);

    if (!companyError && companyProfiles) {
      console.log(`企業プロフィール数: ${companyProfiles.length}件`);
      companyProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.company_user_id}, 名前: ${profile.company_name}, Email: ${profile.company_email}`);
      });
    }
  } catch (err) {
    console.log('企業プロフィール取得エラー:', err.message);
  }

  // 4. auth.usersテーブルも試してみる
  console.log('\n🔐 認証ユーザー情報:');
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers) {
      console.log(`認証ユーザー数: ${authUsers.users?.length || 0}件`);
      authUsers.users?.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, メタデータ:`, user.user_metadata);
      });
    }
  } catch (err) {
    console.log('認証ユーザー取得エラー:', err.message);
  }
}

// 実行
checkTables().catch(console.error);