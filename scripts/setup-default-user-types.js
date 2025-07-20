#!/usr/bin/env node
/**
 * プロフィール未設定ユーザーのデフォルト設定スクリプト
 * 
 * 実行内容：
 * 1. プロフィール未設定ユーザーにデフォルトのユーザータイプを設定
 * 2. test-cfo@example.com は 'cfo' タイプに設定
 * 3. その他は 'company' タイプに設定
 * 4. 今後のログイン時に適切なプロフィール作成画面が表示されるようにする
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

async function setupDefaultUserTypes() {
  console.log('🔧 プロフィール未設定ユーザーのデフォルト設定を開始...\n')

  try {
    // 1. 現在の状況を取得
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

    // 2. プロフィール未設定ユーザーを特定
    const noProfileUsers = authUsers.users.filter(user => {
      return !cfoUserIds.has(user.id) && !bizUserIds.has(user.id)
    })

    console.log('📋 プロフィール未設定ユーザーの処理:')
    console.log('=' * 50)

    let updateCount = 0

    for (const user of noProfileUsers) {
      // メタデータがすでに設定されている場合はスキップ
      if (user.user_metadata.user_type || user.user_metadata.role) {
        console.log(`⏭️  ${user.email}: 既にメタデータ設定済み (${user.user_metadata.user_type || user.user_metadata.role})`)
        continue
      }

      // ユーザータイプの判定ロジック
      let targetUserType = 'company' // デフォルトは企業

      // 特定のメールアドレスの場合はCFOに設定
      if (user.email && user.email.includes('test-cfo')) {
        targetUserType = 'cfo'
      } else if (user.email && user.email.includes('cfo')) {
        targetUserType = 'cfo'
      }

      console.log(`🔄 ${user.email}:`)
      console.log(`   設定予定タイプ: ${targetUserType}`)

      try {
        // ユーザーメタデータを更新
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              user_type: targetUserType,
              profile_setup_required: true // プロフィール作成が必要であることを明示
            }
          }
        )

        if (updateError) {
          console.error(`   ❌ 更新エラー: ${updateError.message}`)
        } else {
          console.log(`   ✅ 更新完了: user_type=${targetUserType}`)
          updateCount++
        }
      } catch (error) {
        console.error(`   ❌ 更新中にエラー: ${error.message}`)
      }
    }

    console.log()
    console.log(`📊 更新結果: ${updateCount}/${noProfileUsers.length} ユーザーのタイプを更新`)

    // 3. 更新後の状況確認
    console.log('\n📊 更新後の全ユーザー状況:')
    console.log('=' * 50)

    const { data: updatedUsers, error: updatedError } = await supabase.auth.admin.listUsers()
    
    if (updatedError) {
      console.error('❌ 更新後のユーザー取得エラー:', updatedError)
      return
    }

    const summary = {
      cfo: 0,
      company: 0,
      unknown: 0,
      withProfile: 0,
      withoutProfile: 0
    }

    updatedUsers.users.forEach(user => {
      const userType = user.user_metadata.user_type || user.user_metadata.role || 'unknown'
      summary[userType] = (summary[userType] || 0) + 1

      const hasProfile = cfoUserIds.has(user.id) || bizUserIds.has(user.id)
      if (hasProfile) {
        summary.withProfile++
      } else {
        summary.withoutProfile++
      }
    })

    console.log(`CFO: ${summary.cfo}`)
    console.log(`企業: ${summary.company}`)
    console.log(`未設定: ${summary.unknown}`)
    console.log(`プロフィール作成済み: ${summary.withProfile}`)
    console.log(`プロフィール未作成: ${summary.withoutProfile}`)

    // 4. 次のステップ
    console.log('\n📋 次のステップ:')
    console.log('=' * 50)

    if (summary.withoutProfile > 0) {
      console.log('🔧 アプリケーション側での対応が必要:')
      console.log('   1. ログイン時にプロフィール作成状況をチェック')
      console.log('   2. profile_setup_required フラグがtrueの場合、プロフィール作成画面にリダイレクト')
      console.log('   3. プロフィール作成完了後、profile_setup_required フラグをfalseに更新')
      console.log('   4. プロフィール未作成の場合、他の機能へのアクセスを制限')
    }

    console.log('\n🔧 推奨するUI改善:')
    console.log('   1. AuthGuardでプロフィール作成状況をチェック')
    console.log('   2. プロフィール作成ウィザードの実装')
    console.log('   3. ユーザータイプに応じた適切なフォーム表示')
    console.log('   4. プロフィール作成完了までの進捗表示')

    console.log('\n✅ デフォルトユーザータイプ設定が完了しました')

  } catch (error) {
    console.error('❌ 処理中にエラーが発生しました:', error)
  }
}

// スクリプト実行
setupDefaultUserTypes()