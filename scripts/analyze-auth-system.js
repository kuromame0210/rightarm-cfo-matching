#!/usr/bin/env node
/**
 * 認証システム詳細分析スクリプト
 * 
 * 分析項目：
 * 1. NextAuth.jsとSupabase Authの統合状況
 * 2. ユーザータイプ判定ロジックの一貫性
 * 3. セッション管理の状況
 * 4. メタデータの更新状況確認
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function analyzeAuthSystem() {
  console.log('🔍 認証システム詳細分析を開始...\n')

  try {
    // 1. 最新のユーザー状況を取得
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth ユーザー取得エラー:', authError)
      return
    }

    // 2. プロフィール情報を取得
    const { data: cfoProfiles } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name, cfo_display_name')

    const { data: bizProfiles } = await supabase
      .from('biz_profiles')
      .select('biz_user_id, biz_company_name')

    const cfoUserIds = new Set(cfoProfiles?.map(p => p.cfo_user_id) || [])
    const bizUserIds = new Set(bizProfiles?.map(p => p.biz_user_id) || [])

    console.log('🔍 1. ユーザーメタデータ vs プロフィール一貫性チェック')
    console.log('=' * 60)

    const inconsistencies = []
    const correctMappings = []

    authUsers.users.forEach(user => {
      const metadataUserType = user.user_metadata.user_type || user.user_metadata.role
      const hasCfoProfile = cfoUserIds.has(user.id)
      const hasBizProfile = bizUserIds.has(user.id)
      
      let actualUserType = null
      if (hasCfoProfile && !hasBizProfile) actualUserType = 'cfo'
      else if (hasBizProfile && !hasCfoProfile) actualUserType = 'business'
      else if (hasCfoProfile && hasBizProfile) actualUserType = 'both'
      else actualUserType = 'none'

      const isConsistent = (
        (metadataUserType === 'cfo' && actualUserType === 'cfo') ||
        (metadataUserType === 'business' && actualUserType === 'business') ||
        (metadataUserType === 'company' && actualUserType === 'business')
      )

      if (!isConsistent && actualUserType !== 'none') {
        inconsistencies.push({
          email: user.email,
          id: user.id,
          metadataUserType: metadataUserType || '未設定',
          actualUserType,
          hasCfoProfile,
          hasBizProfile
        })
      } else if (isConsistent) {
        correctMappings.push({
          email: user.email,
          userType: metadataUserType,
          profileType: actualUserType
        })
      }
    })

    console.log(`✅ 一貫性のあるユーザー: ${correctMappings.length}`)
    correctMappings.forEach(user => {
      console.log(`   ${user.email}: ${user.userType}`)
    })

    console.log(`\n⚠️  不整合のあるユーザー: ${inconsistencies.length}`)
    inconsistencies.forEach(user => {
      console.log(`   ${user.email}:`)
      console.log(`     メタデータ: ${user.metadataUserType}`)
      console.log(`     実際: ${user.actualUserType} (CFO:${user.hasCfoProfile}, Biz:${user.hasBizProfile})`)
    })

    // 3. 認証フローの問題点分析
    console.log('\n🔍 2. 認証フロー問題点分析')
    console.log('=' * 60)

    const noProfileUsers = authUsers.users.filter(user => {
      return !cfoUserIds.has(user.id) && !bizUserIds.has(user.id)
    })

    console.log(`プロフィール未作成ユーザー: ${noProfileUsers.length}`)
    noProfileUsers.forEach(user => {
      const metadataType = user.user_metadata.user_type || user.user_metadata.role || '未設定'
      console.log(`   ${user.email}: メタデータ=${metadataType}`)
    })

    // 4. APIの改善提案
    console.log('\n📋 3. 認証システム改善提案')
    console.log('=' * 60)

    console.log('🔧 A. ユーザータイプ判定ロジックの統一:')
    console.log('   1. メタデータ user_type を最優先とする')
    console.log('   2. メタデータが未設定の場合のみプロフィール存在で判定')
    console.log('   3. company と business の表記を統一')

    console.log('\n🔧 B. プロフィール未作成ユーザーへの対応:')
    console.log('   1. 初回ログイン時の強制プロフィール作成')
    console.log('   2. ユーザータイプ選択画面の表示')
    console.log('   3. プロフィール作成完了まで他機能へのアクセス制限')

    console.log('\n🔧 C. APIレスポンスの改善:')
    console.log('   1. userType を company と cfo の2種類に統一')
    console.log('   2. hasProfile フラグの正確な判定')
    console.log('   3. 初回ログイン検出の仕組み')

    // 5. 実装すべき修正スクリプト
    console.log('\n📋 4. 推奨修正内容')
    console.log('=' * 60)

    if (inconsistencies.length > 0) {
      console.log('🔧 メタデータの修正が必要なユーザー:')
      inconsistencies.forEach(user => {
        let correctType = 'unknown'
        if (user.actualUserType === 'cfo') correctType = 'cfo'
        else if (user.actualUserType === 'business') correctType = 'company'
        
        console.log(`   ${user.email}: ${user.metadataUserType} → ${correctType}`)
      })
    }

    if (noProfileUsers.length > 0) {
      console.log('\n🔧 プロフィール作成が必要なユーザー:')
      noProfileUsers.forEach(user => {
        const suggestedType = user.user_metadata.user_type || user.user_metadata.role || 'company'
        console.log(`   ${user.email}: 推奨タイプ=${suggestedType}`)
      })
    }

    console.log('\n✅ 認証システム分析完了')

  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error)
  }
}

// スクリプト実行
analyzeAuthSystem()