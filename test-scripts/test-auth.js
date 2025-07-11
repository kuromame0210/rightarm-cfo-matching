// 認証APIテストスクリプト
const fs = require('fs')

async function testAuthAPIs() {
  console.log('🔐 認証APIテストを開始...\n')
  
  const baseURL = 'http://localhost:3000'
  
  // テスト用のユーザーデータ
  const testUser = {
    email: 'test-user-' + Date.now() + '@example.com',
    password: 'test123456',
    userType: 'company',
    displayName: 'テストユーザー',
    companyName: 'テスト株式会社',
    businessName: 'テスト事業',
    description: 'テスト用の企業です'
  }
  
  console.log('テストユーザー:', testUser.email)
  
  try {
    // 1. 登録APIテスト
    console.log('\n1️⃣ 登録APIテスト...')
    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    const registerData = await registerResponse.json()
    console.log('登録レスポンス Status:', registerResponse.status)
    console.log('登録レスポンス Body:', JSON.stringify(registerData, null, 2))
    
    if (!registerResponse.ok) {
      console.error('❌ 登録失敗')
      return
    }
    
    console.log('✅ 登録成功')
    
    // 2. ログインAPIテスト（登録直後）
    console.log('\n2️⃣ ログインAPIテスト（登録直後）...')
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('ログインレスポンス Status:', loginResponse.status)
    console.log('ログインレスポンス Body:', JSON.stringify(loginData, null, 2))
    
    if (loginResponse.ok) {
      console.log('✅ ログイン成功')
      
      // 3. セッション確認
      if (loginData.data && loginData.data.session) {
        console.log('\n3️⃣ セッション確認...')
        const token = loginData.data.session.access_token
        
        const validateResponse = await fetch(`${baseURL}/api/auth/validate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        const validateData = await validateResponse.json()
        console.log('認証確認 Status:', validateResponse.status)
        console.log('認証確認 Body:', JSON.stringify(validateData, null, 2))
        
        if (validateResponse.ok) {
          console.log('✅ セッション有効')
        } else {
          console.log('❌ セッション無効')
        }
      }
    } else {
      console.log('❌ ログイン失敗')
      
      // 詳細なエラー調査
      console.log('\n🔍 ログイン失敗の詳細調査...')
      
      // データベースでユーザーを直接確認
      console.log('データベースでユーザー確認を行います...')
    }
    
  } catch (error) {
    console.error('💥 テスト中にエラー:', error.message)
  }
}

// サーバーが起動しているかチェック
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/cfos?limit=1')
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ 開発サーバーが起動していません')
    console.log('npm run dev を実行してサーバーを起動してください')
    return
  }
  
  await testAuthAPIs()
}

main().catch(console.error)