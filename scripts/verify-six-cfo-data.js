#!/usr/bin/env node

/**
 * 指定された6名のCFOデータがデータベースに正常に登録されているかを確認するスクリプト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifySixCfoData() {
  console.log('📋 指定された6名のCFOデータ確認中...\n')
  
  // 確認すべき6名のCFO（重複除去済み）
  const targetCfos = [
    { name: '佐藤大悟', email: 'dai88@example.com', location: '千葉県千葉市' },
    { name: '奥田豊', email: 'okuda@example.com', location: '奈良県生駒市' },
    { name: '佐藤智彦', key: 'tomo', location: '東京都新宿区' },
    { name: '菅原大源', key: 'Taigen', location: 'アメリカ・カリフォルニア州' },
    { name: '副島', key: 'nanalysts', location: '関西' },
    { name: '田中', key: 'ibkipu', location: '北米在住' }
  ]
  
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
    
    console.log('🔍 登録状況確認:\n')
    
    const foundCfos = []
    const missingCfos = []
    
    targetCfos.forEach(target => {
      const found = profiles.filter(profile => {
        // 名前でマッチング
        if (profile.cfo_name === target.name) {
          // 場所でさらに絞り込み
          if (target.location && profile.cfo_location.includes(target.location.split('・')[0])) {
            return true
          }
          if (target.location && profile.cfo_location.includes(target.location)) {
            return true
          }
          return true
        }
        return false
      })
      
      if (found.length > 0) {
        foundCfos.push({ target, profiles: found })
      } else {
        missingCfos.push(target)
      }
    })
    
    // 結果表示
    console.log(`✅ 登録済みCFO: ${foundCfos.length}名`)
    console.log(`❌ 未登録CFO: ${missingCfos.length}名\n`)
    
    // 詳細情報
    foundCfos.forEach(({ target, profiles }, index) => {
      console.log(`${index + 1}. ✅ ${target.name} (${target.location})`)
      if (profiles.length > 1) {
        console.log(`   🔄 重複プロフィール: ${profiles.length}件`)
      }
      const profile = profiles[0]
      console.log(`   📍 場所: ${profile.cfo_location}`)
      console.log(`   ⏰ 稼働: ${profile.cfo_availability}`)
      console.log(`   🏷️ スキル数: ${profile.cfo_skills ? profile.cfo_skills.length : 0}`)
      console.log(`   💰 報酬: ${profile.cfo_compensation || '未設定'}`)
      console.log(`   🎓 資格: ${profile.cfo_certifications || '未設定'}`)
      console.log(`   🌍 エリア: ${profile.cfo_working_areas || '未設定'}`)
      console.log(`   📄 紹介文: ${profile.cfo_introduction ? '設定済み' : '未設定'}`)
      console.log(`   🔗 ID: ${profile.cfo_user_id}`)
      console.log()
    })
    
    if (missingCfos.length > 0) {
      console.log('❌ 未登録のCFO:')
      missingCfos.forEach((cfo, index) => {
        console.log(`${index + 1}. ${cfo.name} (${cfo.location})`)
      })
    }
    
    // 統計情報
    console.log('\n📊 統計情報:')
    console.log(`   総プロフィール数: ${profiles.length}`)
    console.log(`   ターゲットCFO数: ${targetCfos.length}`)
    console.log(`   登録済み: ${foundCfos.length}`)
    console.log(`   未登録: ${missingCfos.length}`)
    console.log(`   登録率: ${((foundCfos.length / targetCfos.length) * 100).toFixed(1)}%`)
    
    // 重複分析
    const duplicateCount = profiles.reduce((acc, profile) => {
      const name = profile.cfo_name
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
    
    const duplicates = Object.entries(duplicateCount).filter(([name, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log('\n⚠️  重複プロフィール:')
      duplicates.forEach(([name, count]) => {
        console.log(`   ${name}: ${count}件`)
      })
    }
    
    console.log('\n🎯 完了! 6名のCFOデータ確認が完了しました。')
    
  } catch (error) {
    console.error('❌ 処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  verifySixCfoData()
}

module.exports = { verifySixCfoData }