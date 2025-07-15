#!/usr/bin/env node

/**
 * テストユーザー作成スクリプト
 * Usage: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// テストユーザーデータ
const testUsers = {
  company: {
    email: 'hokuto@seimitsu.co.jp',
    password: 'TestPassword123!',
    profile: {
      company_name: '株式会社北斗精密',
      company_description: '新潟県長岡市で電子機器向け高精度切削部品を製造。創業25年、国内 Tier-1 サプライヤーへの直販比率が7割。',
      location: '新潟県長岡市',
      revenue_min: 1000000000, // 10億円
      revenue_max: 3000000000, // 30億円
      issues: ['管理会計強化', '原価計算', '銀行融資'],
      raw_profile: `
【会社名】株式会社北斗精密
【所在地】新潟県長岡市
【事業内容】電子機器向け高精度切削部品製造
【創業】25年
【特徴】国内 Tier-1 サプライヤーへの直販比率7割
【推定年商】10〜30億円
【財務課題】
- 管理会計強化：部門別収益性の見える化が必要
- 原価計算：製品別原価の詳細把握
- 銀行融資：設備投資のための資金調達
      `.trim()
    }
  },
  cfo: {
    email: 'dai88@example.com',
    password: 'TestPassword123!',
    profile: {
      name: '佐藤大悟',
      display_name: 'Dai88',
      location: '千葉県千葉市',
      availability: '応相談（臨機応変に対応致します）',
      fee_min: 100000, // 10万円
      fee_max: 1000000, // 成果報酬応相談
      skills: [
        '海外業務',
        'M&A支援',
        'USでのIPOサポート',
        '投資案件発掘',
        '不動産コンサルティング',
        'ビジネスコンサルティング',
        '通訳・翻訳',
        'ビジネス通訳',
        '交渉サポート',
        'クロスボーダーM&A',
        '資金調達支援',
        '投資銀行連携',
        'NYでの上場サポート',
        'フィリピン事業',
        'セブ島投資',
        'ホテル開発',
        '語学学校運営',
        'EC事業',
        '高麗人参事業',
        'タイムシェア事業',
        'インバウンド事業',
        '不動産開発',
        '華僑ネットワーク',
        '海外ネットワーク',
        'リゾート開発'
      ],
      raw_profile: `
【名前】佐藤大悟
【居住地】千葉県千葉市
【週の稼働可能時間】応相談（臨機応変に対応致します）

【経歴】
2001,03 明治大学法学部法律学科卒業
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

今まで7つの事業を行ってきました。2つはM&Aで売却しました。また、海外での事業としてフィリピン・セブ島で複数のビジネスを行いました、特に不動産は力を入れて不動産開発を華僑の仲間達と行いました。現在、開発した投資用ホテルは順調にホテルオペレーションが行われています。また、インバウンドをターゲットとした日本国内のリゾート地でのタイムシェア事業の準備を行っています。USでの投資銀行オーナー達と強いつながりがあるため、日系企業のUSでの上場サポートも行っていけます。

【可能な業務】
・海外、英語を絡めた業務
・USへの上場希望会社のサポート（投資銀行、弁護士事務所、監査法人ご紹介含む）
・一般には出ていない投資案件の発掘
・不動産コンサルティング、各種ビジネスコンサルティング
・通訳、翻訳（ビジネス通訳、交渉は特に得意としています）

【保有資格】
特に無し

【想定月額報酬】
月10万円〜、成果報酬応相談

【対応可能エリア】
例：全国リモートOK、東京近郊は対面可（案件次第では日本国内、海外への出張可）

【紹介文】
M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。
海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。
      `.trim()
    }
  }
}

async function createTestUsers() {
  console.log('🚀 テストユーザーの作成を開始します...')

  try {
    // 1. 企業ユーザーの作成
    console.log('\n📊 企業ユーザーを作成中...')
    const { data: companyAuth, error: companyAuthError } = await supabase.auth.admin.createUser({
      email: testUsers.company.email,
      password: testUsers.company.password,
      email_confirm: true
    })

    if (companyAuthError) {
      console.error('❌ 企業ユーザー作成エラー:', companyAuthError)
      throw companyAuthError
    }

    console.log('✅ 企業ユーザー認証作成完了:', companyAuth.user.id)

    // 企業プロフィール作成
    const { data: companyProfile, error: companyProfileError } = await supabase
      .from('biz_profiles')
      .insert({
        biz_user_id: companyAuth.user.id,
        biz_company_name: testUsers.company.profile.company_name,
        biz_location: testUsers.company.profile.location,
        biz_revenue_min: testUsers.company.profile.revenue_min,
        biz_revenue_max: testUsers.company.profile.revenue_max,
        biz_issues: testUsers.company.profile.issues,
        biz_raw_profile: testUsers.company.profile.raw_profile
      })

    if (companyProfileError) {
      console.error('❌ 企業プロフィール作成エラー:', companyProfileError)
      throw companyProfileError
    }

    console.log('✅ 企業プロフィール作成完了')

    // 2. CFOユーザーの作成
    console.log('\n👤 CFOユーザーを作成中...')
    const { data: cfoAuth, error: cfoAuthError } = await supabase.auth.admin.createUser({
      email: testUsers.cfo.email,
      password: testUsers.cfo.password,
      email_confirm: true
    })

    if (cfoAuthError) {
      console.error('❌ CFOユーザー作成エラー:', cfoAuthError)
      throw cfoAuthError
    }

    console.log('✅ CFOユーザー認証作成完了:', cfoAuth.user.id)

    // CFOプロフィール作成
    const { data: cfoProfile, error: cfoProfileError } = await supabase
      .from('cfo_profiles')
      .insert({
        cfo_user_id: cfoAuth.user.id,
        cfo_name: testUsers.cfo.profile.name,
        cfo_display_name: testUsers.cfo.profile.display_name,
        cfo_location: testUsers.cfo.profile.location,
        cfo_availability: testUsers.cfo.profile.availability,
        cfo_fee_min: testUsers.cfo.profile.fee_min,
        cfo_fee_max: testUsers.cfo.profile.fee_max,
        cfo_skills: testUsers.cfo.profile.skills,
        cfo_raw_profile: testUsers.cfo.profile.raw_profile
      })

    if (cfoProfileError) {
      console.error('❌ CFOプロフィール作成エラー:', cfoProfileError)
      throw cfoProfileError
    }

    console.log('✅ CFOプロフィール作成完了')

    // 3. 結果表示
    console.log('\n🎉 テストユーザー作成完了!')
    console.log('\n📋 作成されたユーザー:')
    console.log(`\n🏢 企業ユーザー:`)
    console.log(`   Email: ${testUsers.company.email}`)
    console.log(`   Password: ${testUsers.company.password}`)
    console.log(`   Company: ${testUsers.company.profile.company_name}`)
    console.log(`   User ID: ${companyAuth.user.id}`)

    console.log(`\n👤 CFOユーザー:`)
    console.log(`   Email: ${testUsers.cfo.email}`)
    console.log(`   Password: ${testUsers.cfo.password}`)
    console.log(`   Name: ${testUsers.cfo.profile.name}`)
    console.log(`   User ID: ${cfoAuth.user.id}`)

    console.log('\n✨ これらの認証情報でログインしてテストできます')

  } catch (error) {
    console.error('❌ テストユーザー作成に失敗しました:', error)
    process.exit(1)
  }
}

// メイン実行
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('\n✅ スクリプト実行完了')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ スクリプト実行エラー:', error)
      process.exit(1)
    })
}

module.exports = { createTestUsers, testUsers }