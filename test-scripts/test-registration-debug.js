// 登録API詳細デバッグテスト
async function testRegistrationDebug() {
  console.log('🔍 登録API詳細デバッグテスト開始...\n')
  
  const baseURL = 'http://localhost:3001'
  
  // テストケース1: 最小限のデータでテスト
  console.log('1️⃣ 最小限データテスト')
  try {
    const response1 = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'minimal.test@example.com',
        password: 'test123456',
        userType: 'cfo',
        displayName: 'Minimal Test User'
      })
    })
    
    const text1 = await response1.text()
    console.log('  Status:', response1.status)
    console.log('  Headers:', Object.fromEntries(response1.headers.entries()))
    console.log('  Raw Response:', text1)
    
    try {
      const data1 = JSON.parse(text1)
      console.log('  Parsed Response:', JSON.stringify(data1, null, 2))
    } catch (parseError) {
      console.log('  ❌ JSON解析エラー:', parseError.message)
    }
    
  } catch (error) {
    console.log('  ❌ リクエストエラー:', error.message)
  }
  
  // テストケース2: バリデーションエラーテスト
  console.log('\n2️⃣ バリデーションエラーテスト')
  try {
    const response2 = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: '123', // 短すぎるパスワード
        userType: 'invalid',
        displayName: ''
      })
    })
    
    const data2 = await response2.json()
    console.log('  Status:', response2.status)
    console.log('  Response:', JSON.stringify(data2, null, 2))
    
  } catch (error) {
    console.log('  ❌ エラー:', error.message)
  }
  
  console.log('\n🎯 登録API詳細デバッグテスト完了!')
}

// サーバーチェック
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/api/cfos?limit=1')
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ 開発サーバーが起動していません')
    console.log('PORT=3001 npm run dev を実行してサーバーを起動してください')
    return
  }
  
  await testRegistrationDebug()
}

main().catch(console.error)