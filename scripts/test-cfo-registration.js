#!/usr/bin/env node

/**
 * CFO登録機能のテスト - cfo_data.mdの要件に基づく実際の登録処理検証
 */

async function testCfoRegistration() {
  console.log('🧪 CFO登録機能テスト開始\n')
  
  // cfo_data.mdの佐藤大悟さんのデータを使用してテスト
  const testCfoData = {
    email: 'sato.daigo.test@example.com',
    password: 'TestPassword123!',
    userType: 'cfo',
    displayName: '佐藤大悟',
    
    // cfo_data.mdの項目に準拠
    location: '千葉県千葉市',
    workingHours: '応相談（臨機応変に対応致します）',
    possibleTasks: '・海外、英語を絡めた業務\n・USへの上場希望会社のサポート（投資銀行、弁護士事務所、監査法人ご紹介含む）\n・一般には出ていない投資案件の発掘\n・不動産コンサルティング、各種ビジネスコンサルティング\n・通訳、翻訳（ビジネス通訳、交渉は特に得意としています）',
    certifications: '特に無し',
    monthlyCompensation: '月10万円〜、成果報酬応相談',
    workingArea: '全国リモートOK、東京近郊は対面可（案件次第では日本国内、海外への出張可）',
    introduction: 'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。\n海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
    experience: `2001,03 明治大学法学部法律学科卒業
2001,04 全国共済農業協同組合会　全国本部　事務企画部　入会
　　JA共済の全国本部にて事務企画で携わる

2001,10 株式会社テーオーダブリュー　イベント企画部　入社
　　全国での多くのイベント企画に携わる

2002,04 株式会社帝国ホテル　レストラン　ユリーカ　入社
　　　　　東京の帝国ホテルのレストランにてウェイター業務

2006,03　 個人事業ファーストウェルネスとしてテニススクール事業を開始
　　
2010, 01 ファーストウェルネスを法人化して株式会社ファーストウェルネス設立
　　　　　北柏、用賀、高津の3エリアでテニススクールを展開

2011,11 フィリピン・セブ島にてFirstwellness English Academy Incを設立
　　　　　日本からの英語留学の語学学校をスタート。2校を展開

2013, 06 IFS PREMIUM PROPERTIES INCをジョイントベンチャーで設立　　
　　　　フィリピン・セブ島にて投資用ホテルを開発。特にマーケティング部分を担当

2013,11 LIFS PREMIUM DEVELOPMENT CORPORATIONをジョイントベンチャーで設立。フィリピン・セブ島にて投資用ホテルを開発。特にマーケティング部分を担当

2016,12 フィリピン・セブ島におけるFirstwellness English Academy IncをM&Aで売却

2017,05 株式会社高麗人参ウェルネスを設立
　　　　韓国から高麗人参を仕入れてEC中心で日本にて販売業務

2022,05 株式会社高麗人参ウェルネスをM&Aで売却

2022,06 株式会社Samurai hospitalityを設立
USでのIPOサポート、海外顧客への不動産コンサルティング等の業務
　　　　　　　　　　　　現在に至る

今まで7つの事業を行ってきました。2つはM&Aで売却しました。また、海外での事業としてフィリピン・セブ島で複数のビジネスを行いました、特に不動産は力を入れて不動産開発を華僑の仲間達と行いました。現在、開発した投資用ホテルは順調にホテルオペレーションが行われています。また、インバウンドをターゲットとした日本国内のリゾート地でのタイムシェア事業の準備を行っています。USでの投資銀行オーナー達と強いつながりがあるため、日系企業のUSでの上場サポートも行っていけます。`
  }

  console.log('📋 テストデータ確認:')
  console.log(`   名前: ${testCfoData.displayName}`)
  console.log(`   居住地: ${testCfoData.location}`)
  console.log(`   稼働時間: ${testCfoData.workingHours}`)
  console.log(`   可能な業務: ${testCfoData.possibleTasks.split('\\n').length}行`)
  console.log(`   保有資格: ${testCfoData.certifications}`)
  console.log(`   想定報酬: ${testCfoData.monthlyCompensation}`)
  console.log(`   対応エリア: ${testCfoData.workingArea}`)
  console.log(`   紹介文: ${testCfoData.introduction.split('\\n').length}行`)
  console.log(`   経歴: ${testCfoData.experience.length}文字\n`)

  try {
    console.log('🌐 登録API呼び出し中...')
    
    // 本番環境と同じ形式でAPIを呼び出し
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCfoData),
    })

    const result = await response.json()

    console.log(`📊 APIレスポンス (${response.status}):`)
    console.log(JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('\n✅ 登録処理成功!')
      console.log(`   ユーザーID: ${result.data?.userId}`)
      console.log(`   メール: ${result.data?.email}`)
      console.log(`   ユーザータイプ: ${result.data?.userType}`)
      
      if (result.data?.userId) {
        // 作成されたプロフィールを確認
        console.log('\n🔍 作成されたプロフィール確認中...')
        await verifyCreatedProfile(result.data.userId)
      }
    } else {
      console.log('\n❌ 登録処理失敗:')
      console.log(`   エラー: ${result.error}`)
    }

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 ヒント: 開発サーバーが起動していない可能性があります')
      console.log('   以下のコマンドで開発サーバーを起動してください:')
      console.log('   npm run dev')
    }
  }
}

/**
 * 作成されたプロフィールの検証
 */
async function verifyCreatedProfile(userId) {
  const { createClient } = require('@supabase/supabase-js')
  require('dotenv').config({ path: '.env.local' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data: profile, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .eq('cfo_user_id', userId)
      .single()

    if (error) {
      console.error('❌ プロフィール取得エラー:', error.message)
      return
    }

    console.log('✅ プロフィール作成確認:')
    console.log(`   名前: ${profile.cfo_name}`)
    console.log(`   表示名: ${profile.cfo_display_name}`)
    console.log(`   居住地: ${profile.cfo_location}`)
    console.log(`   稼働時間: ${profile.cfo_availability}`)
    console.log(`   想定報酬: ${profile.cfo_compensation}`)
    console.log(`   可能な業務: ${profile.cfo_possible_tasks?.length || 0}文字`)
    console.log(`   保有資格: ${profile.cfo_certifications}`)
    console.log(`   対応エリア: ${profile.cfo_working_areas?.length || 0}文字`)
    console.log(`   紹介文: ${profile.cfo_introduction?.length || 0}文字`)
    console.log(`   経歴: ${profile.cfo_raw_profile?.length || 0}文字`)

    // cfo_data.md項目との対応確認
    console.log('\\n📋 cfo_data.md項目対応状況:')
    const mappingResults = [
      { item: '名前', field: 'cfo_name', value: profile.cfo_name, required: true },
      { item: '居住地', field: 'cfo_location', value: profile.cfo_location, required: true },
      { item: '週の稼働可能時間', field: 'cfo_availability', value: profile.cfo_availability, required: true },
      { item: '経歴', field: 'cfo_raw_profile', value: profile.cfo_raw_profile, required: true },
      { item: '可能な業務', field: 'cfo_possible_tasks', value: profile.cfo_possible_tasks, required: true },
      { item: '保有資格', field: 'cfo_certifications', value: profile.cfo_certifications, required: false },
      { item: '想定月額報酬', field: 'cfo_compensation', value: profile.cfo_compensation, required: true },
      { item: '対応可能エリア', field: 'cfo_working_areas', value: profile.cfo_working_areas, required: true },
      { item: '紹介文', field: 'cfo_introduction', value: profile.cfo_introduction, required: true }
    ]

    let allMapped = true
    mappingResults.forEach(({ item, field, value, required }) => {
      const isMapped = value && value.trim() !== ''
      const status = isMapped ? '✅' : (required ? '❌' : '⚠️')
      console.log(`   ${status} ${item} (${field}): ${isMapped ? '設定済み' : '未設定'}`)
      if (required && !isMapped) allMapped = false
    })

    console.log(`\\n📊 全項目対応状況: ${allMapped ? '✅ 完全対応' : '⚠️ 一部未対応'}`)

  } catch (error) {
    console.error('❌ プロフィール検証エラー:', error.message)
  }
}

// 実行
if (require.main === module) {
  testCfoRegistration()
}

module.exports = { testCfoRegistration }