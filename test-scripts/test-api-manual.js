// Manual API Testing Script
// Rextrix APIの手動テスト用スクリプト

async function testAPIEndpoints() {
  const baseURL = 'http://localhost:3002';
  
  console.log('🚀 Rextrix API 認証テスト開始...\n');

  // 1. バリデーションテスト
  console.log('1️⃣ バリデーションテスト');
  try {
    const response = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: '123',
        userType: 'invalid',
        displayName: ''
      })
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status}`);
    console.log(`  ✅ バリデーションエラー: ${data.success ? 'NO' : 'YES'}`);
    console.log(`  ✅ エラー詳細数: ${data.details ? data.details.length : 0}`);
  } catch (error) {
    console.log(`  ❌ バリデーションテストエラー: ${error.message}`);
  }

  // 2. 無効なログインテスト
  console.log('\n2️⃣ 無効なログインテスト');
  try {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      })
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status} (期待: 401)`);
    console.log(`  ✅ エラーメッセージ: ${data.error}`);
    console.log(`  ✅ 認証失敗: ${data.success ? 'NO' : 'YES'}`);
  } catch (error) {
    console.log(`  ❌ ログインテストエラー: ${error.message}`);
  }

  // 3. 空データでのログインテスト
  console.log('\n3️⃣ 空データでのログインテスト');
  try {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: ''
      })
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status} (期待: 400)`);
    console.log(`  ✅ バリデーションエラー: ${data.error}`);
  } catch (error) {
    console.log(`  ❌ 空データテストエラー: ${error.message}`);
  }

  // 4. 無効なトークンでの認証チェックテスト
  console.log('\n4️⃣ 無効なトークンでの認証テスト');
  try {
    const response = await fetch(`${baseURL}/api/auth/validate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status} (期待: 401)`);
    console.log(`  ✅ エラーメッセージ: ${data.error}`);
  } catch (error) {
    console.log(`  ❌ トークン検証テストエラー: ${error.message}`);
  }

  // 5. 認証ヘッダーなしでの認証チェックテスト
  console.log('\n5️⃣ 認証ヘッダーなしテスト');
  try {
    const response = await fetch(`${baseURL}/api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status} (期待: 401)`);
    console.log(`  ✅ エラーメッセージ: ${data.error}`);
  } catch (error) {
    console.log(`  ❌ ヘッダーなしテストエラー: ${error.message}`);
  }

  // 6. 契約API（認証必要）のアクセス拒否テスト
  console.log('\n6️⃣ 認証が必要なエンドポイントへの無認証アクセステスト');
  try {
    const response = await fetch(`${baseURL}/api/contracts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status} (期待: 401)`);
    console.log(`  ✅ エラーメッセージ: ${data.error}`);
  } catch (error) {
    console.log(`  ❌ 契約APIテストエラー: ${error.message}`);
  }

  // 7. CFO一覧API（認証不要）のテスト
  console.log('\n7️⃣ CFO一覧API（認証不要）テスト');
  try {
    const response = await fetch(`${baseURL}/api/cfos?page=1&limit=5`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log(`  ✅ ステータス: ${response.status} (期待: 200)`);
    console.log(`  ✅ 成功: ${data.success ? 'YES' : 'NO'}`);
    console.log(`  ✅ データ配列: ${Array.isArray(data.data) ? 'YES' : 'NO'}`);
    console.log(`  ✅ ページネーション: ${data.pagination ? 'YES' : 'NO'}`);
  } catch (error) {
    console.log(`  ❌ CFO一覧APIテストエラー: ${error.message}`);
  }

  console.log('\n🎯 テスト完了！');
}

// テスト実行
testAPIEndpoints().catch(console.error);