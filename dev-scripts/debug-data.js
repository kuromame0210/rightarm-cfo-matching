// データベース内容確認スクリプト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugData() {
  console.log('🔍 データベース内容確認...\n')
  
  // 1. CFOテーブルの内容確認
  console.log('1️⃣ rextrix_cfosテーブル:')
  const { data: cfos, error: cfoError } = await supabase
    .from('rextrix_cfos')
    .select('*')
  
  if (cfoError) {
    console.error('❌ CFOテーブルエラー:', cfoError.message)
  } else {
    console.log('CFO件数:', cfos?.length || 0)
    if (cfos && cfos.length > 0) {
      console.log('最初のCFO:', JSON.stringify(cfos[0], null, 2))
    }
  }
  
  // 2. ユーザーテーブルの内容確認
  console.log('\n2️⃣ rextrix_usersテーブル:')
  const { data: users, error: userError } = await supabase
    .from('rextrix_users')
    .select('*')
    .eq('user_type', 'cfo')
  
  if (userError) {
    console.error('❌ ユーザーテーブルエラー:', userError.message)
  } else {
    console.log('CFOユーザー件数:', users?.length || 0)
    if (users && users.length > 0) {
      console.log('最初のユーザー:', JSON.stringify(users[0], null, 2))
    }
  }
  
  // 3. プロフィールテーブルの内容確認
  console.log('\n3️⃣ rextrix_user_profilesテーブル:')
  const { data: profiles, error: profileError } = await supabase
    .from('rextrix_user_profiles')
    .select('*')
  
  if (profileError) {
    console.error('❌ プロフィールテーブルエラー:', profileError.message)
  } else {
    console.log('プロフィール件数:', profiles?.length || 0)
    if (profiles && profiles.length > 0) {
      console.log('最初のプロフィール:', JSON.stringify(profiles[0], null, 2))
    }
  }
  
  // 4. 外部キー関係の確認
  console.log('\n4️⃣ 外部キー関係確認:')
  if (cfos && cfos.length > 0 && users && users.length > 0) {
    const cfo = cfos[0]
    const user = users.find(u => u.id === cfo.user_id)
    
    console.log('CFO user_id:', cfo.user_id)
    console.log('対応するユーザー:', user ? 'あり' : 'なし')
    
    if (user) {
      const profile = profiles?.find(p => p.user_id === user.id)
      console.log('対応するプロフィール:', profile ? 'あり' : 'なし')
    }
  }
  
  // 5. APIと同じクエリでテスト
  console.log('\n5️⃣ API同様のクエリテスト:')
  const { data: apiTest, error: apiError } = await supabase
    .from('rextrix_cfos')
    .select('*')
    .limit(3)
  
  if (apiError) {
    console.error('❌ APIテストエラー:', apiError.message)
  } else {
    console.log('API同様クエリ結果:', apiTest?.length || 0, '件')
    console.log('データ:', JSON.stringify(apiTest, null, 2))
  }
}

debugData().catch(console.error)