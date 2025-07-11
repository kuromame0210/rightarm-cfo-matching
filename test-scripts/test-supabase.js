// Supabase接続テスト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase設定:');
console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSupabase() {
  try {
    console.log('\n📊 データベース接続テスト...');
    
    // 1. テーブル一覧取得テスト
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'rextrix_%');
    
    if (tableError) {
      console.error('❌ テーブル取得エラー:', tableError);
    } else {
      console.log('✅ rextrixテーブル数:', tables?.length || 0);
      console.log('テーブル一覧:', tables?.map(t => t.table_name).slice(0, 5));
    }

    // 2. ユーザー登録テスト（管理者権限）
    console.log('\n👤 Auth ユーザー作成テスト...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        user_type: 'company',
        display_name: 'Test User'
      }
    });

    if (authError) {
      console.error('❌ Auth ユーザー作成エラー:', authError);
      return;
    }

    console.log('✅ Auth ユーザー作成成功:', authUser.user?.id);

    // 3. rextrix_usersテーブルへの挿入テスト
    console.log('\n💾 rextrix_users テーブル挿入テスト...');
    const { data: userRecord, error: userError } = await supabase
      .from('rextrix_users')
      .insert({
        supabase_auth_id: authUser.user.id,
        email: authUser.user.email,
        user_type: 'company',
        status: 'active',
        email_verified: true,
        auth_provider: 'supabase'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ rextrix_users 挿入エラー:', userError);
    } else {
      console.log('✅ rextrix_users 挿入成功:', userRecord.id);
    }

    // 4. クリーンアップ
    console.log('\n🧹 テストデータクリーンアップ...');
    if (userRecord?.id) {
      await supabase.from('rextrix_users').delete().eq('id', userRecord.id);
    }
    if (authUser.user?.id) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
    }
    console.log('✅ クリーンアップ完了');

  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

testSupabase();