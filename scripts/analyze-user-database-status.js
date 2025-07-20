#!/usr/bin/env node
/**
 * 既存ユーザーのデータベース状況調査スクリプト
 * 
 * 調査項目：
 * 1. Supabase Authユーザーの一覧とメタデータ状況
 * 2. CFOプロフィールテーブルのユーザー数
 * 3. 企業プロフィールテーブルのユーザー数
 * 4. ユーザータイプが未設定のケース
 * 5. データの整合性問題
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 環境変数が設定されていません:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceRoleKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function analyzeUserDatabase() {
  console.log('🔍 既存ユーザーのデータベース状況を調査中...\n')

  try {
    // 1. Supabase Authユーザーの一覧取得
    console.log('📊 1. Supabase Auth ユーザー一覧')
    console.log('=' * 50)
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth ユーザー取得エラー:', authError)
      return
    }

    console.log(`総 Auth ユーザー数: ${authUsers.users.length}`)
    console.log()

    // Auth ユーザーの詳細分析
    const authUserAnalysis = authUsers.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata
    }))

    console.log('Auth ユーザー詳細:')
    authUserAnalysis.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   作成日: ${user.created_at}`)
      console.log(`   メール確認: ${user.email_confirmed_at ? '✅' : '❌'}`)
      console.log(`   最終サインイン: ${user.last_sign_in_at || 'なし'}`)
      console.log(`   ユーザーメタデータ: ${JSON.stringify(user.user_metadata)}`)
      console.log(`   アプリメタデータ: ${JSON.stringify(user.app_metadata)}`)
      console.log()
    })

    // 2. CFOプロフィールテーブルの状況
    console.log('📊 2. CFO プロフィールテーブル状況')
    console.log('=' * 50)
    
    const { data: cfoProfiles, error: cfoError } = await supabase
      .from('cfo_profiles')
      .select('*')

    if (cfoError) {
      console.error('❌ CFO プロフィール取得エラー:', cfoError)
    } else {
      console.log(`CFO プロフィール数: ${cfoProfiles.length}`)
      console.log()
      
      if (cfoProfiles.length > 0) {
        console.log('CFO プロフィール詳細:')
        cfoProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.cfo_name || '名前未設定'}`)
          console.log(`   ユーザーID: ${profile.cfo_user_id}`)
          console.log(`   表示名: ${profile.cfo_display_name || '未設定'}`)
          console.log(`   所在地: ${profile.cfo_location || '未設定'}`)
          console.log(`   スキル数: ${profile.cfo_skills ? profile.cfo_skills.length : 0}`)
          console.log(`   作成日: ${profile.created_at}`)
          console.log()
        })
      }
    }

    // 3. 企業プロフィールテーブルの状況
    console.log('📊 3. 企業プロフィールテーブル状況')
    console.log('=' * 50)
    
    const { data: bizProfiles, error: bizError } = await supabase
      .from('biz_profiles')
      .select('*')

    if (bizError) {
      console.error('❌ 企業プロフィール取得エラー:', bizError)
    } else {
      console.log(`企業プロフィール数: ${bizProfiles.length}`)
      console.log()
      
      if (bizProfiles.length > 0) {
        console.log('企業プロフィール詳細:')
        bizProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.biz_company_name || '企業名未設定'}`)
          console.log(`   ユーザーID: ${profile.biz_user_id}`)
          console.log(`   所在地: ${profile.biz_location || '未設定'}`)
          console.log(`   課題数: ${profile.biz_issues ? profile.biz_issues.length : 0}`)
          console.log(`   作成日: ${profile.created_at}`)
          console.log()
        })
      }
    }

    // 4. データ整合性チェック
    console.log('📊 4. データ整合性チェック')
    console.log('=' * 50)

    const authUserIds = authUsers.users.map(user => user.id)
    const cfoUserIds = cfoProfiles?.map(profile => profile.cfo_user_id) || []
    const bizUserIds = bizProfiles?.map(profile => profile.biz_user_id) || []

    // Auth ユーザーでプロフィールが存在しないユーザー
    const usersWithoutProfile = authUserIds.filter(id => 
      !cfoUserIds.includes(id) && !bizUserIds.includes(id)
    )

    // CFO プロフィールで Auth ユーザーが存在しないケース
    const orphanedCfoProfiles = cfoUserIds.filter(id => !authUserIds.includes(id))

    // 企業プロフィールで Auth ユーザーが存在しないケース
    const orphanedBizProfiles = bizUserIds.filter(id => !authUserIds.includes(id))

    // 両方のプロフィールを持つユーザー（重複）
    const duplicateProfiles = authUserIds.filter(id => 
      cfoUserIds.includes(id) && bizUserIds.includes(id)
    )

    console.log(`プロフィール未設定ユーザー: ${usersWithoutProfile.length}`)
    if (usersWithoutProfile.length > 0) {
      usersWithoutProfile.forEach(userId => {
        const user = authUsers.users.find(u => u.id === userId)
        console.log(`  - ${user?.email} (${userId})`)
      })
    }
    console.log()

    console.log(`孤立CFOプロフィール: ${orphanedCfoProfiles.length}`)
    if (orphanedCfoProfiles.length > 0) {
      orphanedCfoProfiles.forEach(userId => {
        console.log(`  - ${userId}`)
      })
    }
    console.log()

    console.log(`孤立企業プロフィール: ${orphanedBizProfiles.length}`)
    if (orphanedBizProfiles.length > 0) {
      orphanedBizProfiles.forEach(userId => {
        console.log(`  - ${userId}`)
      })
    }
    console.log()

    console.log(`重複プロフィール: ${duplicateProfiles.length}`)
    if (duplicateProfiles.length > 0) {
      duplicateProfiles.forEach(userId => {
        const user = authUsers.users.find(u => u.id === userId)
        console.log(`  - ${user?.email} (${userId})`)
      })
    }
    console.log()

    // 5. ユーザータイプ判定ロジックの状況
    console.log('📊 5. ユーザータイプ判定状況')
    console.log('=' * 50)

    const userTypeAnalysis = authUsers.users.map(user => {
      const hasCfoProfile = cfoUserIds.includes(user.id)
      const hasBizProfile = bizUserIds.includes(user.id)
      
      let userType = 'unknown'
      if (hasCfoProfile && !hasBizProfile) userType = 'cfo'
      else if (hasBizProfile && !hasCfoProfile) userType = 'business'
      else if (hasCfoProfile && hasBizProfile) userType = 'both'
      
      return {
        email: user.email,
        id: user.id,
        userType,
        hasCfoProfile,
        hasBizProfile
      }
    })

    const typeCounts = userTypeAnalysis.reduce((acc, user) => {
      acc[user.userType] = (acc[user.userType] || 0) + 1
      return acc
    }, {})

    console.log('ユーザータイプ分布:')
    console.log(`  CFO: ${typeCounts.cfo || 0}`)
    console.log(`  企業: ${typeCounts.business || 0}`)
    console.log(`  両方: ${typeCounts.both || 0}`)
    console.log(`  未設定: ${typeCounts.unknown || 0}`)
    console.log()

    console.log('ユーザータイプ詳細:')
    userTypeAnalysis.forEach(user => {
      console.log(`  ${user.email}: ${user.userType}`)
    })

    // 6. 推奨アクション
    console.log('\n📋 推奨アクション')
    console.log('=' * 50)

    if (usersWithoutProfile.length > 0) {
      console.log('⚠️  プロフィール未設定ユーザーへの対応が必要です:')
      console.log('   - ユーザータイプ選択画面を表示')
      console.log('   - 初回ログイン時の強制プロフィール作成')
      console.log('   - または手動でのプロフィール作成促進')
    }

    if (orphanedCfoProfiles.length > 0 || orphanedBizProfiles.length > 0) {
      console.log('⚠️  孤立プロフィールの清理が必要です:')
      console.log('   - 対応するAuthユーザーが存在しないプロフィールを削除')
    }

    if (duplicateProfiles.length > 0) {
      console.log('⚠️  重複プロフィールの整理が必要です:')
      console.log('   - ユーザーに主となるプロフィールタイプを選択させる')
      console.log('   - または両方のプロフィールタイプを許可する仕様に変更')
    }

    console.log('\n✅ 調査完了')

  } catch (error) {
    console.error('❌ 調査中にエラーが発生しました:', error)
  }
}

// スクリプト実行
analyzeUserDatabase()