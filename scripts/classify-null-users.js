#!/usr/bin/env node

/**
 * role: nullのユーザーを適切なユーザータイプに分類するスクリプト
 * プロフィールの存在状況を基に推測分類
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables not found')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function classifyNullUsers() {
  console.log('🔍 role: nullユーザーの分類作業を開始...\n')

  try {
    // 1. 全ユーザーを取得
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ ユーザー一覧取得エラー:', listError)
      return
    }

    // 2. role: nullのユーザーを特定
    const nullUsers = users.filter(user => 
      !user.user_metadata?.role || user.user_metadata.role === null
    )

    console.log(`📊 role: nullのユーザー: ${nullUsers.length}件`)

    if (nullUsers.length === 0) {
      console.log('✅ 分類対象のユーザーはいません')
      return
    }

    // 3. CFOプロフィールの存在を確認
    const { data: cfoProfiles, error: cfoError } = await supabaseAdmin
      .from('cfo_profiles')
      .select('cfo_user_id')
    
    const cfoUserIds = new Set(cfoProfiles?.map(p => p.cfo_user_id) || [])

    // 4. company_profilesテーブルの存在確認
    let companyUserIds = new Set()
    try {
      const { data: companyProfiles, error: companyError } = await supabaseAdmin
        .from('company_profiles')
        .select('company_user_id')
      
      if (!companyError) {
        companyUserIds = new Set(companyProfiles?.map(p => p.company_user_id) || [])
      }
    } catch (err) {
      console.log('ℹ️ company_profilesテーブルが見つからません')
    }

    // 5. ユーザーを分類
    const classification = {
      cfo: [],           // CFOプロフィール存在
      company: [],       // 企業プロフィール存在（または推測）
      unclassified: []   // 分類不可
    }

    for (const user of nullUsers) {
      if (cfoUserIds.has(user.id)) {
        classification.cfo.push(user)
      } else if (companyUserIds.has(user.id)) {
        classification.company.push(user)
      } else {
        // プロフィールが存在しない場合の推測ロジック
        // デフォルトで企業ユーザーと仮定（企業向けプラットフォームのため）
        classification.company.push(user)
      }
    }

    console.log('\n📋 分類結果:')
    console.log(`  CFO: ${classification.cfo.length}件`)
    console.log(`  企業: ${classification.company.length}件`)
    console.log(`  未分類: ${classification.unclassified.length}件`)

    // 6. 分類の詳細表示
    if (classification.cfo.length > 0) {
      console.log('\n🎯 CFOユーザー（プロフィール存在）:')
      classification.cfo.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
      })
    }

    if (classification.company.length > 0) {
      console.log('\n🏢 企業ユーザー（推測分類）:')
      classification.company.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
      })
    }

    // 7. ユーザーに分類確認
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const question = (text) => new Promise((resolve) => rl.question(text, resolve))

    console.log('\n⚠️ 確認: 上記の分類でrole更新を実行しますか？')
    console.log('  - CFOユーザー → role: "cfo" に設定')
    console.log('  - 企業ユーザー → role: "company" に設定')
    
    const confirmation = await question('実行する場合は "yes" を入力してください: ')

    if (confirmation.toLowerCase() !== 'yes') {
      console.log('❌ 分類作業をキャンセルしました')
      rl.close()
      return
    }

    // 8. role更新を実行
    console.log('\n🔄 role更新を実行中...')
    
    let successCount = 0
    let errorCount = 0

    // CFOユーザーの更新
    for (const user of classification.cfo) {
      try {
        const updatedMetadata = {
          ...user.user_metadata,
          role: 'cfo'
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { user_metadata: updatedMetadata }
        )

        if (error) {
          console.error(`❌ ${user.email} CFO更新エラー:`, error)
          errorCount++
        } else {
          console.log(`✅ ${user.email} → role: "cfo"`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ ${user.email} CFO更新中にエラー:`, err.message)
        errorCount++
      }
    }

    // 企業ユーザーの更新
    for (const user of classification.company) {
      try {
        const updatedMetadata = {
          ...user.user_metadata,
          role: 'company'
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { user_metadata: updatedMetadata }
        )

        if (error) {
          console.error(`❌ ${user.email} 企業更新エラー:`, error)
          errorCount++
        } else {
          console.log(`✅ ${user.email} → role: "company"`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ ${user.email} 企業更新中にエラー:`, err.message)
        errorCount++
      }
    }

    // 9. 最終結果の確認
    console.log('\n📈 更新結果:')
    console.log(`  成功: ${successCount}件`)
    console.log(`  エラー: ${errorCount}件`)

    if (errorCount === 0) {
      console.log('✅ 全ユーザーのrole分類が完了しました')
    } else {
      console.log(`⚠️ ${errorCount}件のエラーが発生しました`)
    }

    // 10. 最終確認
    console.log('\n🔍 分類後の状況確認...')
    const { data: { users: finalUsers }, error: finalError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (!finalError) {
      const finalRoleDistribution = finalUsers.reduce((acc, user) => {
        const role = user.user_metadata?.role || 'null'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {})

      console.log('📊 最終的なrole分布:')
      Object.entries(finalRoleDistribution).forEach(([role, count]) => {
        console.log(`  ${role}: ${count}件`)
      })
    }

    rl.close()

  } catch (error) {
    console.error('❌ 分類作業中にエラー:', error)
  }
}

// スクリプト実行
if (require.main === module) {
  classifyNullUsers()
}

module.exports = { classifyNullUsers }