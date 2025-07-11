// シンプルなログインAPIテスト
async function testLoginAPI() {
  console.log('🔐 ログインAPIテスト開始...\n')
  
  const baseURL = 'http://localhost:3001'
  
  // テストケース1: 無効な認証情報
  console.log('1️⃣ 無効な認証情報テスト')
  try {
    const response1 = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      })
    })
    
    const data1 = await response1.json()
    console.log('  Status:', response1.status)
    console.log('  Response:', JSON.stringify(data1, null, 2))
    console.log('  Expected: 401 with error message ✅')
  } catch (error) {
    console.log('  ❌ エラー:', error.message)
  }
  
  // テストケース2: バリデーションエラー
  console.log('\n2️⃣ バリデーションエラーテスト')
  try {
    const response2 = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: ''
      })
    })
    
    const data2 = await response2.json()
    console.log('  Status:', response2.status)
    console.log('  Response:', JSON.stringify(data2, null, 2))
    console.log('  Expected: 400 with validation error ✅')
  } catch (error) {
    console.log('  ❌ エラー:', error.message)
  }
  
  // テストケース3: 既存CFOユーザーでのテスト（Authアカウントなし）
  console.log('\n3️⃣ 既存CFOユーザーテスト（Authアカウントなし）')
  try {
    const response3 = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'daigo.sato@example.com',  // 直接挿入したCFOユーザー
        password: 'anypassword'
      })
    })
    
    const data3 = await response3.json()
    console.log('  Status:', response3.status)
    console.log('  Response:', JSON.stringify(data3, null, 2))
    console.log('  Expected: 401 (Authアカウントなし) ✅')
  } catch (error) {
    console.log('  ❌ エラー:', error.message)
  }
  
  console.log('\n🎯 ログインAPIテスト完了!')
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
  
  await testLoginAPI()
}

main().catch(console.error)