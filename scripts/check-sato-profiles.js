#!/usr/bin/env node

/**
 * 佐藤大悟さんのプロフィール詳細確認スクリプト
 * 複数存在する佐藤大悟さんのデータを整理
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSatoProfiles() {
  console.log('🔍 佐藤大悟さんのプロフィール詳細確認中...\n')
  
  try {
    // 佐藤大悟さんのプロフィールを全て取得
    const { data: profiles, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .or('cfo_name.ilike.%佐藤大悟%,cfo_display_name.ilike.%佐藤大悟%,cfo_display_name.ilike.%Dai88%')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ データ取得エラー:', error)
      return
    }
    
    console.log(`📊 佐藤大悟さんのプロフィール数: ${profiles.length}件\n`)
    
    profiles.forEach((profile, index) => {
      console.log(`=== 佐藤大悟さんのプロフィール ${index + 1} ===`)
      console.log(`ID: ${profile.cfo_user_id}`)
      console.log(`名前: ${profile.cfo_name}`)
      console.log(`表示名: ${profile.cfo_display_name}`)
      console.log(`居住地: ${profile.cfo_location || '未設定'}`)
      console.log(`稼働: ${profile.cfo_availability || '未設定'}`)
      console.log(`スキル数: ${profile.cfo_skills ? profile.cfo_skills.length : 0}`)
      console.log(`スキル: ${profile.cfo_skills ? JSON.stringify(profile.cfo_skills, null, 2) : '[]'}`)
      
      console.log('\n--- 新カラムデータ ---')
      console.log(`報酬: ${profile.cfo_compensation || '未設定'}`)
      console.log(`業務: ${profile.cfo_possible_tasks || '未設定'}`)
      console.log(`資格: ${profile.cfo_certifications || '未設定'}`)
      console.log(`エリア: ${profile.cfo_working_areas || '未設定'}`)
      console.log(`紹介文: ${profile.cfo_introduction || '未設定'}`)
      
      console.log('\n--- Raw Profile ---')
      const rawProfile = profile.cfo_raw_profile || ''
      if (rawProfile.length > 200) {
        console.log(`${rawProfile.substring(0, 200)}...`)
        console.log(`(合計 ${rawProfile.length} 文字)`)
      } else {
        console.log(rawProfile || '(空)')
      }
      
      console.log(`\n作成日時: ${profile.created_at}`)
      console.log(`更新日時: ${profile.updated_at}`)
      
      // データ完成度の評価
      const completeness = calculateCompleteness(profile)
      console.log(`\n📈 データ完成度: ${completeness.percentage}% (${completeness.completed}/${completeness.total})`)
      console.log(`完成項目: ${completeness.completedFields.join(', ')}`)
      if (completeness.missingFields.length > 0) {
        console.log(`未設定項目: ${completeness.missingFields.join(', ')}`)
      }
      
      console.log('\n' + '='.repeat(50) + '\n')
    })
    
    // 重複分析
    if (profiles.length > 1) {
      console.log('🔍 重複分析:')
      console.log(`   同名プロフィール ${profiles.length}件 を検出`)
      
      // 最も完成度の高いプロフィールを特定
      let bestProfile = profiles[0]
      let bestCompleteness = calculateCompleteness(bestProfile)
      
      profiles.forEach(profile => {
        const completeness = calculateCompleteness(profile)
        if (completeness.percentage > bestCompleteness.percentage) {
          bestProfile = profile
          bestCompleteness = completeness
        }
      })
      
      console.log(`   最高完成度: ${bestCompleteness.percentage}% (${bestProfile.cfo_display_name})`)
      console.log(`   推奨プロフィール: ${bestProfile.cfo_user_id}`)
      
      // 統合の推奨
      if (profiles.length > 1) {
        console.log('\n💡 推奨アクション:')
        console.log('   - 最も完成度の高いプロフィールをメインとして使用')
        console.log('   - 他のプロフィールのデータで補完')
        console.log('   - 重複プロフィールの整理を検討')
      }
    }
    
  } catch (error) {
    console.error('❌ 確認処理エラー:', error)
  }
}

/**
 * プロフィールの完成度を計算
 */
function calculateCompleteness(profile) {
  const fields = {
    '基本情報': {
      name: profile.cfo_name,
      displayName: profile.cfo_display_name,
      location: profile.cfo_location,
      availability: profile.cfo_availability
    },
    'スキル・経歴': {
      skills: profile.cfo_skills && profile.cfo_skills.length > 0,
      rawProfile: profile.cfo_raw_profile
    },
    '詳細情報': {
      compensation: profile.cfo_compensation,
      possibleTasks: profile.cfo_possible_tasks,
      certifications: profile.cfo_certifications,
      workingAreas: profile.cfo_working_areas,
      introduction: profile.cfo_introduction
    }
  }
  
  const allFields = Object.values(fields).reduce((acc, category) => {
    return { ...acc, ...category }
  }, {})
  
  const completedFields = []
  const missingFields = []
  
  Object.entries(allFields).forEach(([key, value]) => {
    if (value && value !== '' && value !== null) {
      completedFields.push(key)
    } else {
      missingFields.push(key)
    }
  })
  
  const total = Object.keys(allFields).length
  const completed = completedFields.length
  const percentage = Math.round((completed / total) * 100)
  
  return {
    percentage,
    completed,
    total,
    completedFields,
    missingFields
  }
}

// 実行
if (require.main === module) {
  checkSatoProfiles()
}

module.exports = { checkSatoProfiles }