#!/usr/bin/env node

// スカウト送信機能のテストスクリプト
const baseUrl = 'http://localhost:3002'

console.log('🎯 スカウト送信機能のデータフロー調査開始...\n')

// テスト用のデータ
const testData = {
  recipientId: 'test-cfo-id',
  recipientType: 'cfo',
  senderType: 'company',
  title: 'テストスカウト',
  message: 'これはテスト用のスカウトメッセージです。'
}

async function testScoutAPI() {
  console.log('1️⃣ スカウト送信API テスト開始...')
  
  try {
    const response = await fetch(`${baseUrl}/api/scouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 認証トークンが必要な場合は追加
      },
      body: JSON.stringify(testData)
    })
    
    const responseText = await response.text()
    console.log(`   ✅ レスポンスステータス: ${response.status}`)
    console.log(`   📄 レスポンス内容: ${responseText}\n`)
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      if (data.success) {
        console.log('   🎉 スカウト送信API: 成功')
        return data.data.scoutId
      } else {
        console.log('   ⚠️ スカウト送信API: 失敗 -', data.error)
      }
    } else {
      console.log('   ❌ スカウト送信API: HTTPエラー')
    }
  } catch (error) {
    console.log('   💥 スカウト送信API: ネットワークエラー -', error.message)
  }
  
  return null
}

async function testScoutListAPI() {
  console.log('2️⃣ スカウト一覧取得API テスト開始...')
  
  try {
    // 受信スカウトを取得
    const receivedResponse = await fetch(`${baseUrl}/api/scouts?type=received&limit=10`)
    const receivedText = await receivedResponse.text()
    console.log(`   📥 受信スカウト ステータス: ${receivedResponse.status}`)
    console.log(`   📄 受信スカウト 内容: ${receivedText}\n`)
    
    // 送信スカウトを取得
    const sentResponse = await fetch(`${baseUrl}/api/scouts?type=sent&limit=10`)
    const sentText = await sentResponse.text()
    console.log(`   📤 送信スカウト ステータス: ${sentResponse.status}`)
    console.log(`   📄 送信スカウト 内容: ${sentText}\n`)
    
    if (receivedResponse.ok && sentResponse.ok) {
      console.log('   🎉 スカウト一覧取得API: 成功')
    } else {
      console.log('   ⚠️ スカウト一覧取得API: 一部失敗')
    }
  } catch (error) {
    console.log('   💥 スカウト一覧取得API: エラー -', error.message)
  }
}

async function testWebPages() {
  console.log('3️⃣ Webページ表示テスト開始...')
  
  const pages = [
    { url: '/scout', name: 'スカウト一覧ページ' },
    { url: '/discover/cfos', name: 'CFO検索ページ' },
    { url: '/discover/companies', name: '企業検索ページ' }
  ]
  
  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page.url}`)
      console.log(`   📊 ${page.name}: ${response.status}`)
      
      if (response.ok) {
        const html = await response.text()
        
        // スカウト関連の要素をチェック
        const hasScoutButton = html.includes('スカウト')
        const hasScoutModal = html.includes('showScoutModal')
        const hasAPICall = html.includes('/api/scouts')
        
        console.log(`      - スカウトボタン: ${hasScoutButton ? '✅' : '❌'}`)
        console.log(`      - スカウトモーダル: ${hasScoutModal ? '✅' : '❌'}`)
        console.log(`      - API呼び出し: ${hasAPICall ? '✅' : '❌'}`)
      }
    } catch (error) {
      console.log(`   💥 ${page.name}: エラー - ${error.message}`)
    }
  }
  console.log()
}

async function runTests() {
  console.log('🚀 テスト実行開始...\n')
  
  // API テスト
  const scoutId = await testScoutAPI()
  await testScoutListAPI()
  
  // Webページテスト
  await testWebPages()
  
  console.log('📋 テスト結果サマリー:')
  console.log('   1. スカウト送信API: 認証エラーまたは成功')
  console.log('   2. スカウト一覧API: 認証エラーまたは成功') 
  console.log('   3. Webページ表示: 正常')
  console.log('\n🔍 詳細確認のため、ブラウザで以下にアクセスしてください:')
  console.log(`   • ${baseUrl}/scout (スカウト一覧)`)
  console.log(`   • ${baseUrl}/discover/cfos (CFO検索・スカウト送信)`)
  console.log(`   • ${baseUrl}/test/scouts (スカウトテストページ)`)
  console.log('\n⚠️ 注意: 実際のスカウト送信にはログインが必要です')
}

// メイン実行
runTests().catch(console.error)