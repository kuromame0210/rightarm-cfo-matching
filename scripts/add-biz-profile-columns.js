#!/usr/bin/env node

/**
 * biz_profilesテーブルに詳細フィールドを追加するスクリプト
 * Supabase Client経由でテーブル構造を変更
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addBizProfileColumns() {
  console.log('🚀 biz_profilesテーブルのカラム追加を開始...\n')
  
  try {
    // 1. 現在の状態確認
    console.log('📊 現在の状態確認:')
    const { data: currentData, error: currentError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(1)
    
    if (currentError) {
      console.error('❌ 現在の状態確認エラー:', currentError)
      return
    }
    
    const currentColumns = currentData && currentData.length > 0 ? Object.keys(currentData[0]) : []
    const targetColumns = ['biz_description', 'biz_revenue_range', 'biz_challenge_background']
    
    console.log('既存カラム:', currentColumns.join(', '))
    targetColumns.forEach(col => {
      const exists = currentColumns.includes(col)
      console.log(`  - ${col}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
    })
    
    // 2. カラム追加（Service Role権限で直接実行）
    console.log('\n💡 注意: Supabaseでは動的なDDL実行に制限があります')
    console.log('以下のSQLを手動でSupabase SQLエディタで実行してください:\n')
    
    const sqlCommands = [
      'ALTER TABLE biz_profiles ADD COLUMN IF NOT EXISTS biz_description TEXT;',
      'ALTER TABLE biz_profiles ADD COLUMN IF NOT EXISTS biz_revenue_range TEXT;',
      'ALTER TABLE biz_profiles ADD COLUMN IF NOT EXISTS biz_challenge_background TEXT;',
      '',
      "COMMENT ON COLUMN biz_profiles.biz_description IS '事業内容・企業概要（詳細テキスト）';",
      "COMMENT ON COLUMN biz_profiles.biz_revenue_range IS '売上規模（テキスト形式）';",
      "COMMENT ON COLUMN biz_profiles.biz_challenge_background IS '経営課題・背景（詳細テキスト）';"
    ]
    
    console.log('--- 実行用SQL ---')
    sqlCommands.forEach(cmd => console.log(cmd))
    console.log('--- SQL終了 ---\n')
    
    // 3. 既存データの移行処理（カラムが存在する場合）
    console.log('📋 既存データの移行を試行中...')
    
    const { data: allProfiles, error: allError } = await supabase
      .from('biz_profiles')
      .select('*')
    
    if (allError) {
      console.error('❌ 既存データ取得エラー:', allError)
      return
    }
    
    console.log(`取得した企業プロフィール: ${allProfiles.length}件`)
    
    // 各プロフィールを更新
    for (const profile of allProfiles) {
      const updateData = {}
      
      // biz_descriptionの生成
      if (profile.biz_raw_profile) {
        updateData.biz_description = profile.biz_raw_profile.substring(0, 500)
      }
      
      // biz_revenue_rangeの生成
      if (profile.biz_revenue_min && profile.biz_revenue_max) {
        const formatAmount = (amount) => {
          if (amount >= 1000000000) return `${Math.floor(amount / 1000000000)}億円`
          if (amount >= 100000000) return `${Math.floor(amount / 100000000)}千万円`
          if (amount >= 10000000) return `${Math.floor(amount / 10000000)}百万円`
          return `${amount}円`
        }
        updateData.biz_revenue_range = `${formatAmount(profile.biz_revenue_min)} 〜 ${formatAmount(profile.biz_revenue_max)}`
      }
      
      // biz_challenge_backgroundの生成
      if (profile.biz_issues && Array.isArray(profile.biz_issues) && profile.biz_issues.length > 0) {
        updateData.biz_challenge_background = `主要課題: ${profile.biz_issues.join(', ')}`
      }
      
      // 更新実行（カラムが存在する場合のみ）
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('biz_profiles')
          .update(updateData)
          .eq('biz_user_id', profile.biz_user_id)
        
        if (updateError) {
          console.log(`⚠️  ${profile.biz_company_name} の更新エラー: ${updateError.message}`)
        } else {
          console.log(`✅ ${profile.biz_company_name} の移行データ準備完了`)
        }
      }
    }
    
    console.log('\n🔄 手動でのカラム追加が必要です')
    console.log('1. Supabase Dashboard > SQL Editor を開く')
    console.log('2. 上記のSQLを実行')
    console.log('3. 再度このスクリプトを実行して確認')
    
  } catch (error) {
    console.error('❌ カラム追加処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  addBizProfileColumns()
}

module.exports = { addBizProfileColumns }