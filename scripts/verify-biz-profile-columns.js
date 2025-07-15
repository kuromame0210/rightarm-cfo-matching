#!/usr/bin/env node

/**
 * biz_profilesテーブルの詳細カラム追加完了確認スクリプト
 * 2025-07-15: マイグレーション完了後の検証用
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyBizProfileColumns() {
  console.log('🔍 biz_profilesテーブルの詳細カラム追加完了確認...\n')
  
  try {
    // 1. カラムの存在確認
    const { data: testData, error: testError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ テーブルアクセスエラー:', testError)
      return
    }
    
    const currentColumns = testData && testData.length > 0 ? Object.keys(testData[0]) : []
    const targetColumns = ['biz_description', 'biz_revenue_range', 'biz_challenge_background']
    
    console.log('📊 現在のカラム:')
    console.log('   ', currentColumns.join(', '))
    
    console.log('\n🎯 必要なカラムの確認:')
    let allColumnsExist = true
    targetColumns.forEach(col => {
      const exists = currentColumns.includes(col)
      console.log(`   ${col}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
      if (!exists) allColumnsExist = false
    })
    
    if (allColumnsExist) {
      console.log('\n✅ すべての必要なカラムが存在します！')
      
      // 2. 既存データの移行実行
      console.log('\n📋 既存データの移行を実行中...')
      
      const { data: profiles, error: profilesError } = await supabase
        .from('biz_profiles')
        .select('*')
      
      if (profilesError) {
        console.error('❌ プロフィールデータ取得エラー:', profilesError)
        return
      }
      
      let migrationCount = 0
      
      for (const profile of profiles) {
        const updateData = {}
        
        // 既存データから詳細項目を生成
        if (!profile.biz_description && profile.biz_raw_profile) {
          updateData.biz_description = profile.biz_raw_profile.substring(0, 500)
        }
        
        if (!profile.biz_revenue_range && profile.biz_revenue_min && profile.biz_revenue_max) {
          const formatAmount = (amount) => {
            if (amount >= 1000000000) return `${Math.floor(amount / 1000000000)}億円`
            if (amount >= 100000000) return `${Math.floor(amount / 100000000)}千万円`
            if (amount >= 10000000) return `${Math.floor(amount / 10000000)}百万円`
            return `${amount}円`
          }
          updateData.biz_revenue_range = `${formatAmount(profile.biz_revenue_min)} 〜 ${formatAmount(profile.biz_revenue_max)}`
        }
        
        if (!profile.biz_challenge_background && profile.biz_issues && Array.isArray(profile.biz_issues) && profile.biz_issues.length > 0) {
          updateData.biz_challenge_background = `主要課題: ${profile.biz_issues.join(', ')}`
        }
        
        // 更新が必要な場合のみ実行
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('biz_profiles')
            .update(updateData)
            .eq('biz_user_id', profile.biz_user_id)
          
          if (updateError) {
            console.log(`   ⚠️  ${profile.biz_company_name} の更新エラー: ${updateError.message}`)
          } else {
            console.log(`   ✅ ${profile.biz_company_name} の詳細項目を更新`)
            migrationCount++
          }
        }
      }
      
      console.log(`\n📈 移行完了: ${migrationCount}件のプロフィールを更新`)
      
      // 3. 最終確認
      console.log('\n📋 最終確認:')
      const { data: finalData, error: finalError } = await supabase
        .from('biz_profiles')
        .select('biz_company_name, biz_description, biz_revenue_range, biz_challenge_background')
        .limit(3)
      
      if (!finalError && finalData) {
        finalData.forEach((record, index) => {
          console.log(`\n   【企業 ${index + 1}】 ${record.biz_company_name}`)
          console.log(`     事業内容: ${record.biz_description?.substring(0, 100) || '未設定'}...`)
          console.log(`     売上規模: ${record.biz_revenue_range || '未設定'}`)
          console.log(`     経営課題: ${record.biz_challenge_background || '未設定'}`)
        })
      }
      
    } else {
      console.log('\n❌ カラムが不足しています')
      console.log('Supabase Dashboard > SQL Editor で以下のSQLを実行してください:')
      console.log('')
      console.log('ALTER TABLE biz_profiles ADD COLUMN IF NOT EXISTS biz_description TEXT;')
      console.log('ALTER TABLE biz_profiles ADD COLUMN IF NOT EXISTS biz_revenue_range TEXT;')
      console.log('ALTER TABLE biz_profiles ADD COLUMN IF NOT EXISTS biz_challenge_background TEXT;')
    }
    
  } catch (error) {
    console.error('❌ 検証処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  verifyBizProfileColumns()
}

module.exports = { verifyBizProfileColumns }