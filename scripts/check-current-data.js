/**
 * 現在のデータベース状況確認スクリプト
 */

require('dotenv').config({ path: '.env.test' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkCurrentData() {
  console.log('🔍 現在のデータベース状況を詳細確認\n');
  
  try {
    // 現在のユーザー一覧
    const { data: users, error: usersError } = await supabaseAdmin
      .from('rextrix_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('❌ ユーザー取得エラー:', usersError);
      return;
    }
    
    console.log('👤 現在のユーザー:');
    users?.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.email} (${user.user_type}) - ID: ${user.id}`);
      console.log(`      作成日: ${new Date(user.created_at).toLocaleString('ja-JP')}`);
      console.log(`      ステータス: ${user.status}`);
    });
    
    // CFOプロファイル
    const { data: cfos, error: cfosError } = await supabaseAdmin
      .from('rextrix_cfos')
      .select('*');
    
    console.log(`\n💼 CFOプロファイル (${cfos?.length || 0}件):`);
    cfos?.forEach((cfo, i) => {
      console.log(`   ${i+1}. user_id: ${cfo.user_id}`);
      console.log(`      経験年数: ${cfo.experience_years}年`);
      console.log(`      利用可能: ${cfo.is_available ? 'はい' : 'いいえ'}`);
    });
    
    // ユーザープロファイル
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('rextrix_user_profiles')
      .select('*');
    
    console.log(`\n📝 ユーザープロファイル (${profiles?.length || 0}件):`);
    profiles?.forEach((profile, i) => {
      console.log(`   ${i+1}. user_id: ${profile.user_id}`);
      console.log(`      表示名: ${profile.display_name}`);
      console.log(`      電話: ${profile.phone_number || 'なし'}`);
    });
    
  } catch (error) {
    console.error('❌ データ確認エラー:', error);
  }
}

checkCurrentData();