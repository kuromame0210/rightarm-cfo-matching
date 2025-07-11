// スカウト機能の簡単なテストスクリプト
const testScoutAPI = async () => {
  const baseUrl = 'http://localhost:3002'
  
  console.log('🧪 Starting Scout Function Tests...')
  
  try {
    // テスト1: スカウト一覧API
    console.log('\n1. Testing Scout List API...')
    const scoutResponse = await fetch(`${baseUrl}/api/scouts`, {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    })
    
    if (scoutResponse.ok) {
      const scoutData = await scoutResponse.json()
      console.log('✅ Scout List API:', scoutData.success ? 'SUCCESS' : 'FAILED')
      console.log(`   - Received scouts: ${scoutData.data?.received?.length || 0}`)
      console.log(`   - Sent scouts: ${scoutData.data?.sent?.length || 0}`)
    } else {
      console.log('❌ Scout List API: FAILED', scoutResponse.status)
    }
    
    // テスト2: メッセージAPI
    console.log('\n2. Testing Messages API...')
    const messageResponse = await fetch(`${baseUrl}/api/conversations`, {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    })
    
    if (messageResponse.ok) {
      const messageData = await messageResponse.json()
      console.log('✅ Messages API:', messageData.success ? 'SUCCESS' : 'FAILED')
      console.log(`   - Conversations: ${messageData.data?.length || 0}`)
    } else {
      console.log('❌ Messages API: FAILED', messageResponse.status)
    }
    
    // テスト3: 統合テストAPI
    console.log('\n3. Testing Integration Test API...')
    const testResponse = await fetch(`${baseUrl}/api/test/scouts?type=db`, {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    })
    
    if (testResponse.ok) {
      const testData = await testResponse.json()
      console.log('✅ Integration Test API:', testData.success ? 'SUCCESS' : 'FAILED')
      if (testData.data?.results) {
        testData.data.results.forEach(result => {
          console.log(`   - ${result.test}: ${result.status}`)
        })
      }
    } else {
      console.log('❌ Integration Test API: FAILED', testResponse.status)
    }
    
    console.log('\n✅ All tests completed!')
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message)
  }
}

// Node.js環境で実行
if (typeof require !== 'undefined') {
  const fetch = require('node-fetch')
  testScoutAPI()
}

// ブラウザ環境で実行
if (typeof window !== 'undefined') {
  window.testScoutAPI = testScoutAPI
}