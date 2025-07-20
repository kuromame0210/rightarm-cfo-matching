#!/usr/bin/env node
/**
 * 最終状況確認スクリプト
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function finalStatusCheck() {
  console.log('📊 最終状況確認\n')

  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth ユーザー取得エラー:', authError)
      return
    }

    const { data: cfoProfiles } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id')

    const { data: bizProfiles } = await supabase
      .from('biz_profiles')
      .select('biz_user_id')

    const cfoUserIds = new Set(cfoProfiles?.map(p => p.cfo_user_id) || [])
    const bizUserIds = new Set(bizProfiles?.map(p => p.biz_user_id) || [])

    console.log('📋 全ユーザー状況:')
    console.log('=' * 50)

    const summary = {
      cfo: 0,
      company: 0,
      business: 0,
      unknown: 0,
      withProfile: 0,
      withoutProfile: 0
    }

    authUsers.users.forEach(user => {
      const userType = user.user_metadata.user_type || user.user_metadata.role || 'unknown'
      summary[userType] = (summary[userType] || 0) + 1

      const hasProfile = cfoUserIds.has(user.id) || bizUserIds.has(user.id)
      if (hasProfile) {
        summary.withProfile++
      } else {
        summary.withoutProfile++
      }

      console.log(`${user.email}:`)
      console.log(`  メタデータ: ${userType}`)
      console.log(`  プロフィール: ${hasProfile ? '作成済み' : '未作成'}`)
      console.log(`  profile_setup_required: ${user.user_metadata.profile_setup_required || false}`)
      console.log()
    })

    console.log('📊 集計結果:')
    console.log(`総ユーザー数: ${authUsers.users.length}`)
    console.log(`CFO: ${summary.cfo}`)
    console.log(`企業(company): ${summary.company}`)
    console.log(`企業(business): ${summary.business}`)
    console.log(`未設定: ${summary.unknown}`)
    console.log(`プロフィール作成済み: ${summary.withProfile}`)
    console.log(`プロフィール未作成: ${summary.withoutProfile}`)

    if (summary.unknown === 0 && summary.withoutProfile > 0) {
      console.log('\n✅ 全ユーザーにユーザータイプが設定されました！')
      console.log('📝 次のステップ: プロフィール未作成ユーザーのプロフィール作成が必要です')
    } else if (summary.unknown > 0) {
      console.log('\n⚠️  まだユーザータイプが未設定のユーザーがいます')
    } else {
      console.log('\n🎉 全ユーザーの設定が完了しています！')
    }

  } catch (error) {
    console.error('❌ エラー:', error)
  }
}

finalStatusCheck()