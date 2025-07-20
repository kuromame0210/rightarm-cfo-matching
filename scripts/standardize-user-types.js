#!/usr/bin/env node

/**
 * ユーザータイプ統一スクリプト
 * business → company に統一し、プロフィール作成状況も確認
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables not found')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function standardizeUserTypes() {
  console.log('🔄 ユーザータイプ統一作業を開始...\n')

  try {
    // 1. Supabase Authのユーザー一覧を取得
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ ユーザー一覧取得エラー:', listError)
      return
    }

    console.log(`📊 総ユーザー数: ${users.length}`)

    // 2. user_metadataのroleがbusinessのユーザーを特定
    const businessUsers = users.filter(user => 
      user.user_metadata && user.user_metadata.role === 'business'
    )

    console.log(`🎯 businessタイプのユーザー: ${businessUsers.length}件`)

    if (businessUsers.length === 0) {
      console.log('✅ businessタイプのユーザーは見つかりませんでした（統一済み）')
    } else {
      console.log('\n📝 businessタイプユーザーの詳細:')
      businessUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
      })
    }

    // 3. 全ユーザーのrole分布を確認
    const roleDistribution = users.reduce((acc, user) => {
      const role = user.user_metadata?.role || 'null'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 現在のrole分布:')
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}件`)
    })

    // 4. businessユーザーをcompanyに変更
    if (businessUsers.length > 0) {
      console.log('\n🔄 business → company統一を実行中...')
      
      for (const user of businessUsers) {
        try {
          // user_metadataを更新（roleをbusinessからcompanyに変更）
          const updatedMetadata = {
            ...user.user_metadata,
            role: 'company'
          }

          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: updatedMetadata }
          )

          if (updateError) {
            console.error(`❌ ${user.email} の更新エラー:`, updateError)
          } else {
            console.log(`✅ ${user.email} を business → company に更新完了`)
          }
        } catch (err) {
          console.error(`❌ ${user.email} の更新中にエラー:`, err.message)
        }
      }
    }

    // 5. プロフィール作成状況の確認
    console.log('\n📋 プロフィール作成状況を確認中...')
    
    // CFOプロフィールの確認
    const { data: cfoProfiles, error: cfoError } = await supabaseAdmin
      .from('cfo_profiles')
      .select('cfo_user_id')
    
    const cfoUserIds = new Set(cfoProfiles?.map(p => p.cfo_user_id) || [])

    // company_profilesテーブルが存在するか確認
    let companyUserIds = new Set()
    try {
      const { data: companyProfiles, error: companyError } = await supabaseAdmin
        .from('company_profiles')
        .select('company_user_id')
      
      if (!companyError) {
        companyUserIds = new Set(companyProfiles?.map(p => p.company_user_id) || [])
      }
    } catch (err) {
      console.log('ℹ️ company_profilesテーブルが見つからません（未作成の可能性）')
    }

    // 6. プロフィール未作成ユーザーの特定
    const profileStats = {
      cfo: { total: 0, hasProfile: 0, needsProfile: [] },
      company: { total: 0, hasProfile: 0, needsProfile: [] },
      other: { total: 0, hasProfile: 0, needsProfile: [] }
    }

    for (const user of users) {
      const role = user.user_metadata?.role || 'other'
      const category = role === 'cfo' ? 'cfo' : role === 'company' ? 'company' : 'other'
      
      profileStats[category].total++
      
      if (role === 'cfo') {
        if (cfoUserIds.has(user.id)) {
          profileStats[category].hasProfile++
        } else {
          profileStats[category].needsProfile.push({
            id: user.id,
            email: user.email,
            role: role
          })
        }
      } else if (role === 'company') {
        if (companyUserIds.has(user.id)) {
          profileStats[category].hasProfile++
        } else {
          profileStats[category].needsProfile.push({
            id: user.id,
            email: user.email,
            role: role
          })
        }
      }
    }

    console.log('\n📈 プロフィール作成状況統計:')
    Object.entries(profileStats).forEach(([type, stats]) => {
      if (stats.total > 0) {
        console.log(`  ${type}: ${stats.hasProfile}/${stats.total} がプロフィール作成済み`)
        if (stats.needsProfile.length > 0) {
          console.log(`    未作成ユーザー:`)
          stats.needsProfile.forEach(user => {
            console.log(`      - ${user.email} (${user.role})`)
          })
        }
      }
    })

    // 7. 統一作業後の最終確認
    if (businessUsers.length > 0) {
      console.log('\n🔍 統一作業後の確認...')
      const { data: { users: updatedUsers }, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (!error) {
        const updatedRoleDistribution = updatedUsers.reduce((acc, user) => {
          const role = user.user_metadata?.role || 'null'
          acc[role] = (acc[role] || 0) + 1
          return acc
        }, {})

        console.log('📊 統一後のrole分布:')
        Object.entries(updatedRoleDistribution).forEach(([role, count]) => {
          console.log(`  ${role}: ${count}件`)
        })

        const remainingBusiness = updatedUsers.filter(user => 
          user.user_metadata && user.user_metadata.role === 'business'
        )

        if (remainingBusiness.length === 0) {
          console.log('✅ business → company統一が完了しました')
        } else {
          console.log(`⚠️ まだ${remainingBusiness.length}件のbusinessユーザーが残っています`)
        }
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📋 作業完了サマリー:')
    console.log(`  統一対象: ${businessUsers.length}件`)
    
    const totalNeedsProfile = Object.values(profileStats).reduce((sum, stats) => sum + stats.needsProfile.length, 0)
    if (totalNeedsProfile > 0) {
      console.log(`  プロフィール未作成: ${totalNeedsProfile}件`)
      console.log('  → AuthGuardでのリダイレクト対応が必要')
    } else {
      console.log('  プロフィール: 全ユーザー作成済み')
    }

  } catch (error) {
    console.error('❌ 統一作業中にエラー:', error)
  }
}

// スクリプト実行
if (require.main === module) {
  standardizeUserTypes()
}

module.exports = { standardizeUserTypes }