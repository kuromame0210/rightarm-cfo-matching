// CFOデータ移行スクリプト
// マークダウンデータをデータベース形式に変換して挿入

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '設定済み' : '未設定')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 構造化されたCFOデータを読み込み
const fs = require('fs')
const path = require('path')

function loadCFOData() {
  try {
    const dataPath = path.join(__dirname, 'cfo-data.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const { cfos } = JSON.parse(rawData)
    return cfos
  } catch (error) {
    console.error('CFOデータの読み込みエラー:', error)
    return []
  }
}

const cfoData = loadCFOData()

async function migrateCFOData() {
  console.log('🚀 CFOデータ移行を開始します...')

  for (const cfo of cfoData) {
    try {
      console.log(`\n📝 ${cfo.profile.displayName} (${cfo.profile.nickname}) の移行を開始...`)

      // 1. Supabase Authでユーザー作成
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cfo.profile.email,
        password: 'temp123456', // 一時パスワード
        email_confirm: true,
        user_metadata: {
          user_type: 'cfo',
          display_name: cfo.profile.displayName
        }
      })

      if (authError) {
        console.error(`❌ Auth作成エラー (${cfo.profile.displayName}):`, authError)
        continue
      }

      const userId = authData.user.id
      console.log(`✅ Authユーザー作成: ${userId}`)

      // 2. rextrix_users テーブルにレコード作成
      const { data: userData, error: userError } = await supabase
        .from('rextrix_users')
        .insert({
          supabase_auth_id: userId,
          email: cfo.profile.email,
          user_type: 'cfo',
          status: 'active',
          email_verified: true
        })
        .select()
        .single()

      if (userError) {
        console.error(`❌ Users作成エラー (${cfo.profile.displayName}):`, userError)
        continue
      }

      console.log(`✅ Usersレコード作成: ${userData.id}`)

      // 3. rextrix_user_profiles テーブルにプロフィール作成
      const { error: profileError } = await supabase
        .from('rextrix_user_profiles')
        .insert({
          user_id: userData.id,
          display_name: cfo.profile.displayName,
          nickname: cfo.profile.nickname,
          introduction: cfo.profile.introduction,
          region: cfo.profile.region,
          work_preference: cfo.profile.workPreference,
          compensation_range: cfo.profile.compensationRange
        })

      if (profileError) {
        console.error(`❌ Profile作成エラー (${cfo.profile.displayName}):`, profileError)
        continue
      }

      console.log(`✅ Profileレコード作成`)

      // 4. rextrix_cfos テーブルにCFO情報作成
      const { data: cfoRecord, error: cfoError } = await supabase
        .from('rextrix_cfos')
        .insert({
          user_id: userData.id,
          experience_years: cfo.experience.years,
          experience_summary: cfo.experience.summary,
          achievements: cfo.experience.achievements,
          certifications: cfo.certifications,
          is_available: true,
          max_concurrent_projects: 3,
          rating: 4.5, // デフォルト評価
          review_count: 0
        })
        .select()
        .single()

      if (cfoError) {
        console.error(`❌ CFO作成エラー (${cfo.profile.displayName}):`, cfoError)
        continue
      }

      console.log(`✅ CFOレコード作成: ${cfoRecord.id}`)

      // 5. スキルタグの作成・関連付け（オプション）
      if (cfo.skills.length > 0) {
        console.log(`📋 スキル関連付け: ${cfo.skills.length}個`)
        // 実装は必要に応じて追加
      }

      console.log(`🎉 ${cfo.profile.displayName} の移行完了!`)

    } catch (error) {
      console.error(`💥 ${cfo.profile.displayName} の移行中にエラー:`, error)
    }
  }

  console.log('\n🏁 CFOデータ移行完了!')
}

// 実行チェック
if (require.main === module) {
  if (!supabaseUrl.includes('supabase')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URLを設定してください')
    process.exit(1)
  }
  
  if (!supabaseServiceKey.includes('eyJ')) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEYを設定してください')
    process.exit(1)
  }

  migrateCFOData().catch(console.error)
}

module.exports = { migrateCFOData }