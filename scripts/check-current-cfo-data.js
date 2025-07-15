#!/usr/bin/env node

/**
 * CFOプロフィールの現在の状態を確認するスクリプト
 * 移行前の状況把握用
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkCurrentCfoData() {
  console.log('🔍 CFOプロフィールの現在の状態をチェック中...\n')
  
  try {
    // 全CFOプロフィールを取得
    const { data: profiles, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ データ取得エラー:', error)
      return
    }
    
    console.log(`📊 総CFOプロフィール数: ${profiles.length}`)
    
    // 統計情報
    const stats = {
      totalProfiles: profiles.length,
      hasRawProfile: 0,
      hasCompensation: 0,
      hasPossibleTasks: 0,
      hasCertifications: 0,
      hasWorkingAreas: 0,
      hasIntroduction: 0,
      emptyNewColumns: 0
    }
    
    // 詳細確認
    profiles.forEach((profile, index) => {
      console.log(`\n--- CFO ${index + 1}: ${profile.cfo_user_id} ---`)
      console.log(`名前: ${profile.cfo_name || '未設定'}`)
      console.log(`表示名: ${profile.cfo_display_name || '未設定'}`)
      console.log(`場所: ${profile.cfo_location || '未設定'}`)
      console.log(`稼働: ${profile.cfo_availability || '未設定'}`)
      console.log(`スキル: ${profile.cfo_skills ? JSON.stringify(profile.cfo_skills) : '未設定'}`)
      
      // Raw Profile
      if (profile.cfo_raw_profile) {
        stats.hasRawProfile++
        console.log(`Raw Profile: ${profile.cfo_raw_profile.substring(0, 100)}${profile.cfo_raw_profile.length > 100 ? '...' : ''}`)
      } else {
        console.log(`Raw Profile: 未設定`)
      }
      
      // 新しいカラムの状態
      const newColumns = {
        compensation: profile.cfo_compensation,
        possibleTasks: profile.cfo_possible_tasks,
        certifications: profile.cfo_certifications,
        workingAreas: profile.cfo_working_areas,
        introduction: profile.cfo_introduction
      }
      
      let hasAnyNewData = false
      Object.entries(newColumns).forEach(([key, value]) => {
        if (value) {
          stats[`has${key.charAt(0).toUpperCase() + key.slice(1)}`]++
          hasAnyNewData = true
          console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`)
        } else {
          console.log(`${key}: 未設定`)
        }
      })
      
      if (!hasAnyNewData) {
        stats.emptyNewColumns++
      }
    })
    
    // 統計サマリー
    console.log('\n📈 統計サマリー:')
    console.log(`   総プロフィール数: ${stats.totalProfiles}`)
    console.log(`   Raw Profile有り: ${stats.hasRawProfile}`)
    console.log(`   新カラム すべて空: ${stats.emptyNewColumns}`)
    console.log('\n新カラムの設定状況:')
    console.log(`   報酬設定済み: ${stats.hasCompensation}`)
    console.log(`   業務設定済み: ${stats.hasPossibleTasks}`)
    console.log(`   資格設定済み: ${stats.hasCertifications}`)
    console.log(`   エリア設定済み: ${stats.hasWorkingAreas}`)
    console.log(`   紹介文設定済み: ${stats.hasIntroduction}`)
    
    const migrationNeeded = stats.hasRawProfile > 0 && stats.emptyNewColumns > 0
    console.log(`\n🔄 移行の必要性: ${migrationNeeded ? 'あり' : 'なし'}`)
    
    if (migrationNeeded) {
      console.log('   → Raw Profileがあり、新カラムが空のプロフィールが存在します')
      console.log('   → migrate-cfo-json-to-columns.js の実行を推奨します')
    }
    
  } catch (error) {
    console.error('❌ チェック処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  checkCurrentCfoData()
}

module.exports = { checkCurrentCfoData }