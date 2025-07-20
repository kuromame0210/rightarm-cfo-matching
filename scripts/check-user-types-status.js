#!/usr/bin/env node

/**
 * ユーザータイプの現在の状況を確認するスクリプト
 * business → company統一が必要かチェック
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserTypesStatus() {
  console.log('🔍 ユーザータイプの現在の状況を確認中...\n')

  try {
    // 1. profilesテーブルのuser_type分布を確認
    const { data: userTypeStats, error: statsError } = await supabase
      .from('profiles')
      .select('user_type')
    
    if (statsError) {
      console.error('❌ Error fetching user type stats:', statsError)
      return
    }

    // user_typeの分布を集計
    const typeDistribution = userTypeStats.reduce((acc, profile) => {
      const type = profile.user_type || 'null'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    console.log('📊 ユーザータイプの分布:')
    Object.entries(typeDistribution).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}件`)
    })

    // 2. businessタイプのユーザーが存在するかチェック
    const businessUsers = userTypeStats.filter(p => p.user_type === 'business')
    
    console.log(`\n🎯 businessタイプのユーザー: ${businessUsers.length}件`)
    
    if (businessUsers.length > 0) {
      console.log('⚠️  business → company への統一が必要です')
    } else {
      console.log('✅ businessタイプは見つかりませんでした（統一済み可能性）')
    }

    // 3. profile_setup_requiredフラグの状況確認
    const { data: setupRequiredStats, error: setupError } = await supabase
      .from('profiles')
      .select('user_type, profile_setup_required')
    
    if (setupError) {
      console.error('❌ Error fetching setup required stats:', setupError)
      return
    }

    const setupStats = setupRequiredStats.reduce((acc, profile) => {
      const type = profile.user_type || 'null'
      if (!acc[type]) acc[type] = { total: 0, setupRequired: 0 }
      acc[type].total++
      if (profile.profile_setup_required) acc[type].setupRequired++
      return acc
    }, {})

    console.log('\n📋 profile_setup_requiredフラグの状況:')
    Object.entries(setupStats).forEach(([type, stats]) => {
      console.log(`  ${type}: ${stats.setupRequired}/${stats.total} がプロフィール作成必要`)
    })

    // 4. 具体的なbusinessユーザーの詳細表示（もしあれば）
    if (businessUsers.length > 0) {
      const { data: businessDetails, error: businessError } = await supabase
        .from('profiles')
        .select('id, email, user_type, profile_setup_required, created_at')
        .eq('user_type', 'business')
        .limit(10)
      
      if (!businessError && businessDetails.length > 0) {
        console.log('\n📝 businessタイプユーザーの詳細（最大10件）:')
        businessDetails.forEach(user => {
          console.log(`  - ${user.email} (ID: ${user.id.slice(0, 8)}..., 作成: ${user.created_at}, セットアップ必要: ${user.profile_setup_required})`)
        })
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📈 統一作業の必要性:')
    
    if (businessUsers.length > 0) {
      console.log('❗ 【アクション必要】business → company統一スクリプトの実行が必要')
    } else {
      console.log('✅ 【統一済み】business → company統一は完了済みまたは不要')
    }

    const totalSetupRequired = Object.values(setupStats).reduce((sum, stats) => sum + stats.setupRequired, 0)
    if (totalSetupRequired > 0) {
      console.log(`❗ 【要対応】${totalSetupRequired}名のユーザーがプロフィール作成待ち`)
    } else {
      console.log('✅ 【完了】全ユーザーがプロフィール作成済み')
    }
    
  } catch (error) {
    console.error('❌ Error during check:', error)
  }
}

// スクリプト実行
checkUserTypesStatus()