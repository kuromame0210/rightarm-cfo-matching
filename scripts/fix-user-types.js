#!/usr/bin/env node
/**
 * ユーザータイプ自動設定スクリプト
 * 
 * 実行内容：
 * 1. プロフィール未設定ユーザーに適切なユーザータイプを設定
 * 2. ユーザーメタデータの user_type フィールドを更新
 * 3. 既存のプロフィールデータに基づく自動判定
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

async function fixUserTypes() {
  console.log('🔧 ユーザータイプ自動設定を開始します...\n')

  try {
    // 1. 現在のユーザー状況を取得
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth ユーザー取得エラー:', authError)
      return
    }

    const { data: cfoProfiles, error: cfoError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id')

    if (cfoError) {
      console.error('❌ CFO プロフィール取得エラー:', cfoError)
      return
    }

    const { data: bizProfiles, error: bizError } = await supabase
      .from('biz_profiles')
      .select('biz_user_id')

    if (bizError) {
      console.error('❌ 企業プロフィール取得エラー:', bizError)
      return
    }

    // 2. ユーザータイプ判定とメタデータ更新
    const cfoUserIds = cfoProfiles.map(profile => profile.cfo_user_id)
    const bizUserIds = bizProfiles.map(profile => profile.biz_user_id)

    console.log('📋 ユーザータイプ設定状況:')
    console.log('=' * 50)

    let updateCount = 0

    for (const user of authUsers.users) {
      const hasCfoProfile = cfoUserIds.includes(user.id)
      const hasBizProfile = bizUserIds.includes(user.id)
      
      let targetUserType = null
      let currentUserType = user.user_metadata.user_type || user.user_metadata.role

      if (hasCfoProfile && !hasBizProfile) {
        targetUserType = 'cfo'
      } else if (hasBizProfile && !hasCfoProfile) {
        targetUserType = 'business'
      } else if (hasCfoProfile && hasBizProfile) {
        targetUserType = 'both'
      }

      // 現在のユーザータイプと異なる場合、または未設定の場合に更新
      if (targetUserType && targetUserType !== currentUserType) {
        console.log(`🔄 ${user.email}:`)
        console.log(`   現在: ${currentUserType || '未設定'} → 更新後: ${targetUserType}`)

        try {
          // ユーザーメタデータを更新
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            {
              user_metadata: {
                ...user.user_metadata,
                user_type: targetUserType
              }
            }
          )

          if (updateError) {
            console.error(`   ❌ 更新エラー: ${updateError.message}`)
          } else {
            console.log(`   ✅ 更新完了`)
            updateCount++
          }
        } catch (error) {
          console.error(`   ❌ 更新中にエラー: ${error.message}`)
        }

      } else if (targetUserType) {
        console.log(`✅ ${user.email}: ${targetUserType} (変更不要)`)
      } else {
        console.log(`⚠️  ${user.email}: プロフィール未設定 (手動対応必要)`)
      }
    }

    console.log()
    console.log(`📊 更新結果: ${updateCount}/${authUsers.users.length} ユーザーのタイプを更新`)

    // 3. 更新後の状況確認
    console.log('\n📊 更新後のユーザータイプ分布:')
    console.log('=' * 50)

    const { data: updatedUsers, error: updatedError } = await supabase.auth.admin.listUsers()
    
    if (updatedError) {
      console.error('❌ 更新後のユーザー取得エラー:', updatedError)
      return
    }

    const typeCounts = updatedUsers.users.reduce((acc, user) => {
      const userType = user.user_metadata.user_type || user.user_metadata.role || 'unknown'
      acc[userType] = (acc[userType] || 0) + 1
      return acc
    }, {})

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

    // 4. 推奨事項
    console.log('\n📋 次のステップ:')
    console.log('=' * 50)

    const unknownUsers = updatedUsers.users.filter(user => 
      !user.user_metadata.user_type && !user.user_metadata.role
    )

    if (unknownUsers.length > 0) {
      console.log('⚠️  以下のユーザーは手動での対応が必要です:')
      unknownUsers.forEach(user => {
        console.log(`   - ${user.email} (プロフィール未作成)`)
      })
      console.log()
      console.log('推奨対応:')
      console.log('   1. 初回ログイン時にユーザータイプ選択画面を表示')
      console.log('   2. プロフィール作成を必須にする')
      console.log('   3. または管理者が手動でユーザータイプを設定')
    } else {
      console.log('✅ 全ユーザーのユーザータイプが設定されています')
    }

    console.log('\n✅ ユーザータイプ自動設定が完了しました')

  } catch (error) {
    console.error('❌ 処理中にエラーが発生しました:', error)
  }
}

// スクリプト実行
fixUserTypes()