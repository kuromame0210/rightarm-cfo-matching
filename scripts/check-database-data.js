// データベースの実際のデータ構造とサンプルデータを確認するスクリプト
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDatabaseData() {
  console.log('🔍 データベースのデータ構造とサンプルデータを確認中...\n')

  // 1. cfo_profilesテーブルの確認
  console.log('📋 1. cfo_profilesテーブルの確認')
  console.log('=' .repeat(50))
  
  try {
    // テーブル構造の確認（PostgreSQL情報スキーマから）
    const { data: cfoColumns, error: cfoColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'cfo_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (cfoColumnsError) {
      console.error('❌ cfo_profilesカラム情報の取得エラー:', cfoColumnsError)
    } else if (cfoColumns && cfoColumns.length > 0) {
      console.log('\n📝 cfo_profilesテーブルのカラム構造:')
      cfoColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }

    // サンプルデータの取得
    const { data: cfoData, error: cfoError } = await supabase
      .from('cfo_profiles')
      .select('*')
      .limit(3)

    if (cfoError) {
      console.error('❌ cfo_profilesデータ取得エラー:', cfoError)
    } else {
      console.log(`\n📊 cfo_profilesサンプルデータ (${cfoData?.length || 0}件):`)
      if (cfoData && cfoData.length > 0) {
        cfoData.forEach((profile, index) => {
          console.log(`\n  🧑‍💼 サンプル ${index + 1}:`)
          console.log(`    - cfo_user_id: ${profile.cfo_user_id}`)
          console.log(`    - cfo_name: ${profile.cfo_name}`)
          console.log(`    - cfo_display_name: ${profile.cfo_display_name}`)
          console.log(`    - cfo_location: ${profile.cfo_location}`)
          console.log(`    - cfo_availability: ${profile.cfo_availability}`)
          console.log(`    - cfo_fee_min: ${profile.cfo_fee_min}`)
          console.log(`    - cfo_fee_max: ${profile.cfo_fee_max}`)
          console.log(`    - cfo_skills: ${JSON.stringify(profile.cfo_skills)}`)
          console.log(`    - cfo_raw_profile: ${profile.cfo_raw_profile?.substring(0, 100)}...`)
        })
      } else {
        console.log('    📭 データが存在しません')
      }
    }
  } catch (error) {
    console.error('❌ cfo_profiles確認中にエラー:', error)
  }

  console.log('\n\n📋 2. biz_profilesテーブルの確認')
  console.log('=' .repeat(50))
  
  try {
    // テーブル構造の確認
    const { data: bizColumns, error: bizColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'biz_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (bizColumnsError) {
      console.error('❌ biz_profilesカラム情報の取得エラー:', bizColumnsError)
    } else if (bizColumns && bizColumns.length > 0) {
      console.log('\n📝 biz_profilesテーブルのカラム構造:')
      bizColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }

    // サンプルデータの取得
    const { data: bizData, error: bizError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(3)

    if (bizError) {
      console.error('❌ biz_profilesデータ取得エラー:', bizError)
    } else {
      console.log(`\n📊 biz_profilesサンプルデータ (${bizData?.length || 0}件):`)
      if (bizData && bizData.length > 0) {
        bizData.forEach((profile, index) => {
          console.log(`\n  🏢 サンプル ${index + 1}:`)
          console.log(`    - biz_user_id: ${profile.biz_user_id}`)
          console.log(`    - biz_company_name: ${profile.biz_company_name}`)
          console.log(`    - biz_location: ${profile.biz_location}`)
          console.log(`    - biz_revenue_min: ${profile.biz_revenue_min}`)
          console.log(`    - biz_revenue_max: ${profile.biz_revenue_max}`)
          console.log(`    - biz_issues: ${JSON.stringify(profile.biz_issues)}`)
          console.log(`    - biz_raw_profile: ${profile.biz_raw_profile?.substring(0, 100)}...`)
        })
      } else {
        console.log('    📭 データが存在しません')
      }
    }
  } catch (error) {
    console.error('❌ biz_profiles確認中にエラー:', error)
  }

  console.log('\n\n📋 3. messagesテーブルの確認（スカウト関連）')
  console.log('=' .repeat(50))
  
  try {
    // スカウトメッセージのサンプルデータの取得
    const { data: scoutData, error: scoutError } = await supabase
      .from('messages')
      .select('*')
      .eq('msg_type', 'scout')
      .limit(3)

    if (scoutError) {
      console.error('❌ スカウトメッセージ取得エラー:', scoutError)
    } else {
      console.log(`\n📊 スカウトメッセージサンプルデータ (${scoutData?.length || 0}件):`)
      if (scoutData && scoutData.length > 0) {
        scoutData.forEach((message, index) => {
          console.log(`\n  📩 スカウト ${index + 1}:`)
          console.log(`    - msg_id: ${message.msg_id}`)
          console.log(`    - sender_id: ${message.sender_id}`)
          console.log(`    - receiver_id: ${message.receiver_id}`)
          console.log(`    - msg_type: ${message.msg_type}`)
          console.log(`    - body: ${message.body?.substring(0, 100)}...`)
          console.log(`    - sent_at: ${message.sent_at}`)
        })
      } else {
        console.log('    📭 スカウトメッセージが存在しません')
      }
    }
  } catch (error) {
    console.error('❌ スカウトメッセージ確認中にエラー:', error)
  }

  // 4. 既存のformatScoutData関数の確認
  console.log('\n\n📋 4. 現在のformatScoutData関数の調査')
  console.log('=' .repeat(50))
  console.log('📁 ファイル検索を別途実行して確認してください')
}

checkDatabaseData().catch(console.error)