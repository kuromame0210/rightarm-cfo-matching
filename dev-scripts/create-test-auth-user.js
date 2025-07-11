// テスト用のSupabase Authユーザーを作成
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestAuthUser() {
  console.log('🔑 テスト用Authユーザー作成...\n')
  
  // 既存のCFOユーザーを確認
  const { data: existingUsers, error: fetchError } = await supabase
    .from('rextrix_users')
    .select('id, email, supabase_auth_id')
    .eq('user_type', 'cfo')
    .limit(1)
  
  if (fetchError) {
    console.error('❌ ユーザー取得エラー:', fetchError.message)
    return
  }
  
  if (!existingUsers || existingUsers.length === 0) {
    console.error('❌ CFOユーザーが見つかりません')
    return
  }
  
  const testUser = existingUsers[0]
  console.log('🎯 テスト対象ユーザー:', testUser.email)
  
  // 既にSupabase Authアカウントがある場合はスキップ
  if (testUser.supabase_auth_id) {
    console.log('✅ 既にAuthアカウントが存在します:', testUser.supabase_auth_id)
    
    // パスワードでテスト
    await testLogin(testUser.email, 'test123456')
    return
  }
  
  // Supabase Authアカウントを作成
  const testPassword = 'test123456'
  
  try {
    console.log('👤 Supabase Authアカウント作成中...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        user_type: 'cfo',
        display_name: 'Test CFO User'
      }
    })
    
    if (authError) {
      console.error('❌ Auth作成エラー:', authError.message)
      return
    }
    
    console.log('✅ Authユーザー作成成功:', authData.user.id)
    
    // rextrix_usersテーブルのsupabase_auth_idを更新
    const { error: updateError } = await supabase
      .from('rextrix_users')
      .update({ supabase_auth_id: authData.user.id })
      .eq('id', testUser.id)
    
    if (updateError) {
      console.error('❌ ユーザー更新エラー:', updateError.message)
      return
    }
    
    console.log('✅ ユーザーテーブル更新完了')
    
    // ログインテスト
    await testLogin(testUser.email, testPassword)
    
  } catch (error) {
    console.error('💥 予期しないエラー:', error.message)
  }
}

async function testLogin(email, password) {
  console.log('\n🔐 ログインAPIテスト...')
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    console.log('ログイン結果:')
    console.log('  Status:', response.status)
    console.log('  Success:', data.success)
    
    if (data.success) {
      console.log('  ✅ ログイン成功!')
      console.log('  User Type:', data.data?.user?.user_type)
      console.log('  Display Name:', data.data?.user?.rextrix_user_profiles?.[0]?.display_name)
      console.log('  Session:', data.data?.session ? '存在' : '不存在')
    } else {
      console.log('  ❌ ログイン失敗:', data.error)
    }
    
  } catch (error) {
    console.error('💥 ログインテストエラー:', error.message)
  }
}

createTestAuthUser().catch(console.error)