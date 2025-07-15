// CFO一覧のお気に入り機能テスト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testFavoritesFunction() {
  console.log('🧪 Testing CFO favorites functionality...')
  
  try {
    // 1. APIエンドポイントのテスト
    console.log('\n1. Testing API endpoints...')
    
    // GET /api/interests のテスト
    const getResponse = await fetch('http://localhost:3001/api/interests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // 認証状態をシミュレート
      }
    })
    
    console.log('GET /api/interests status:', getResponse.status)
    const getData = await getResponse.json()
    console.log('GET response:', JSON.stringify(getData, null, 2))
    
    // 2. データベースのlikesテーブルの状態確認
    console.log('\n2. Checking database state...')
    const { data: likes, error } = await supabase
      .from('likes')
      .select('*')
    
    if (error) {
      console.error('❌ Error querying likes table:', error)
    } else {
      console.log(`✅ Found ${likes.length} likes in database`)
      likes.forEach((like, index) => {
        console.log(`  ${index + 1}. ${like.liker_id} → ${like.target_id}`)
      })
    }
    
    // 3. CFOプロフィールの確認
    console.log('\n3. Checking CFO profiles...')
    const { data: cfos, error: cfoError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name, cfo_display_name')
      .limit(5)
    
    if (cfoError) {
      console.error('❌ Error querying CFO profiles:', cfoError)
    } else {
      console.log(`✅ Found ${cfos.length} CFO profiles`)
      cfos.forEach((cfo, index) => {
        console.log(`  ${index + 1}. ${cfo.cfo_user_id}: ${cfo.cfo_display_name || cfo.cfo_name}`)
      })
    }
    
    // 4. 企業プロフィールの確認
    console.log('\n4. Checking business profiles...')
    const { data: businesses, error: bizError } = await supabase
      .from('biz_profiles')
      .select('biz_user_id, biz_company_name')
      .limit(5)
    
    if (bizError) {
      console.error('❌ Error querying business profiles:', bizError)
    } else {
      console.log(`✅ Found ${businesses.length} business profiles`)
      businesses.forEach((biz, index) => {
        console.log(`  ${index + 1}. ${biz.biz_user_id}: ${biz.biz_company_name}`)
      })
    }
    
    // 5. 認証ユーザーの確認
    console.log('\n5. Checking auth users...')
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .limit(5)
    
    if (userError) {
      console.error('❌ Error querying auth users:', userError)
    } else {
      console.log(`✅ Found ${users.length} auth users`)
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.id}: ${user.email}`)
      })
    }
    
    // 6. POSTリクエストのテスト（実際のユーザーID使用）
    if (cfos.length > 0 && businesses.length > 0) {
      console.log('\n6. Testing POST request...')
      
      const testData = {
        targetUserId: cfos[0].cfo_user_id,
        targetType: 'cfo'
      }
      
      const postResponse = await fetch('http://localhost:3001/api/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'next-auth.session-token=test' // 認証状態をシミュレート
        },
        body: JSON.stringify(testData)
      })
      
      console.log('POST /api/interests status:', postResponse.status)
      const postData = await postResponse.json()
      console.log('POST response:', JSON.stringify(postData, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testFavoritesFunction()