#!/usr/bin/env node

/**
 * 佐藤大悟さん（Dai88）のプロフィール表示シミュレーション
 * 実際の画面UIとデータベースのデータを対応付けて表示
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simulateProfileDisplay() {
  console.log('🖥️  佐藤大悟さん（Dai88）のプロフィール表示シミュレーション\n')
  
  try {
    // Dai88さんのプロフィールを取得
    const { data: profile, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .eq('cfo_display_name', 'Dai88')
      .single()
    
    if (error || !profile) {
      console.error('❌ プロフィール取得エラー:', error)
      return
    }
    
    console.log('📊 取得したデータベース情報:')
    console.log(`   ID: ${profile.cfo_user_id}`)
    console.log(`   名前: ${profile.cfo_name}`)
    console.log(`   表示名: ${profile.cfo_display_name}`)
    console.log(`   場所: ${profile.cfo_location}`)
    console.log(`   稼働: ${profile.cfo_availability}`)
    console.log(`   スキル数: ${profile.cfo_skills.length}`)
    
    console.log('\n' + '='.repeat(80))
    console.log('🖥️  実際の画面表示シミュレーション')
    console.log('='.repeat(80))
    
    // プロフィール画像エリアの表示
    console.log('\n📸 プロフィール画像エリア:')
    console.log('┌────────────────────────────────────────────────┐')
    console.log('│                  👤                           │')
    console.log(`│            ${profile.cfo_display_name}                        │`)
    console.log('│                  CFO                           │')
    console.log('└────────────────────────────────────────────────┘')
    
    // CFOプロフィール情報セクション
    console.log('\n👤 CFOプロフィール情報:')
    console.log('─'.repeat(50))
    
    // 基本情報
    console.log('\n📋 基本情報:')
    console.log(`   名前: ${profile.cfo_name || '未設定'}`)
    console.log(`   メールアドレス: dai88@example.com （変更不可）`)
    console.log(`   居住地: ${profile.cfo_location || '未設定'}`)
    console.log(`   週の稼働可能時間: ${profile.cfo_availability || '未設定'}`)
    
    // 経歴
    console.log('\n📝 経歴:')
    const rawProfile = profile.cfo_raw_profile || ''
    if (rawProfile.length > 200) {
      console.log(`   ${rawProfile.substring(0, 200)}...`)
      console.log(`   (合計 ${rawProfile.length} 文字)`)
    } else {
      console.log(`   ${rawProfile || '未設定'}`)
    }
    
    // 新カラムデータの表示シミュレーション
    console.log('\n💼 可能な業務:')
    if (profile.cfo_skills && profile.cfo_skills.length > 0) {
      const skillChunks = []
      for (let i = 0; i < profile.cfo_skills.length; i += 3) {
        skillChunks.push(profile.cfo_skills.slice(i, i + 3))
      }
      skillChunks.forEach(chunk => {
        const skillTags = chunk.map(skill => `[${skill}]`).join(' ')
        console.log(`   ${skillTags}`)
      })
    } else {
      console.log('   業務が未設定です')
    }
    
    console.log('\n🏅 保有資格:')
    if (profile.cfo_certifications && profile.cfo_certifications.trim() !== '') {
      const certifications = profile.cfo_certifications.split('\n').filter(cert => cert.trim())
      certifications.forEach(cert => {
        console.log(`   ・ ${cert}`)
      })
    } else {
      console.log('   資格が未設定です')
    }
    
    console.log('\n💰 想定月額報酬:')
    if (profile.cfo_compensation && profile.cfo_compensation.trim() !== '') {
      console.log(`   ${profile.cfo_compensation}`)
    } else {
      // フィー情報から推定
      const feeMin = profile.cfo_fee_min ? Math.floor(profile.cfo_fee_min / 10000) : null
      const feeMax = profile.cfo_fee_max ? Math.floor(profile.cfo_fee_max / 10000) : null
      if (feeMin || feeMax) {
        console.log(`   最低額: ${feeMin ? `${feeMin}万円` : '未設定'}`)
        console.log(`   最高額: ${feeMax ? `${feeMax}万円` : '未設定'}`)
      } else {
        console.log('   報酬が未設定です')
      }
    }
    
    console.log('\n🗺️  対応可能エリア:')
    if (profile.cfo_working_areas && profile.cfo_working_areas.trim() !== '') {
      const areas = profile.cfo_working_areas.split('\n').filter(area => area.trim())
      areas.forEach(area => {
        console.log(`   ・ ${area}`)
      })
    } else {
      console.log('   エリアが未設定です')
    }
    
    console.log('\n📝 紹介文:')
    if (profile.cfo_introduction && profile.cfo_introduction.trim() !== '') {
      const introduction = profile.cfo_introduction.replace(/\n/g, '\n   ')
      console.log(`   ${introduction}`)
    } else {
      console.log('   紹介文が未設定です')
    }
    
    // データ完成度の評価
    console.log('\n' + '='.repeat(80))
    console.log('📈 プロフィール完成度分析')
    console.log('='.repeat(80))
    
    const completeness = analyzeCompleteness(profile)
    
    console.log(`\n📊 完成度: ${completeness.percentage}% (${completeness.completed}/${completeness.total}項目)`)
    
    console.log('\n✅ 設定済み項目:')
    completeness.completedFields.forEach(field => {
      console.log(`   ・ ${field.name}: ${field.status}`)
    })
    
    if (completeness.missingFields.length > 0) {
      console.log('\n❌ 未設定項目:')
      completeness.missingFields.forEach(field => {
        console.log(`   ・ ${field.name}: ${field.status}`)
      })
    }
    
    // ユーザー体験の評価
    console.log('\n🎯 ユーザー体験評価:')
    if (completeness.percentage >= 90) {
      console.log('   🌟 優秀: 非常に充実したプロフィールです')
      console.log('   💼 企業からの信頼度が高いでしょう')
    } else if (completeness.percentage >= 70) {
      console.log('   👍 良好: 基本的な情報は揃っています')
      console.log('   📝 さらに詳細を追加すると良いでしょう')
    } else {
      console.log('   ⚠️  改善の余地: プロフィールの充実が必要です')
      console.log('   📋 基本情報の入力を完了させましょう')
    }
    
    // cfo_data.mdとの対応確認
    console.log('\n📄 cfo_data.mdとの対応状況:')
    const cfoDataMapping = checkCfoDataMapping(profile)
    Object.entries(cfoDataMapping).forEach(([key, status]) => {
      const icon = status.mapped ? '✅' : '❌'
      console.log(`   ${icon} ${key}: ${status.description}`)
    })
    
  } catch (error) {
    console.error('❌ シミュレーション処理エラー:', error)
  }
}

/**
 * プロフィール完成度を分析
 */
function analyzeCompleteness(profile) {
  const fields = [
    { 
      name: '名前', 
      value: profile.cfo_name,
      weight: 10 
    },
    { 
      name: '表示名', 
      value: profile.cfo_display_name,
      weight: 5 
    },
    { 
      name: '居住地', 
      value: profile.cfo_location,
      weight: 8 
    },
    { 
      name: '稼働可能時間', 
      value: profile.cfo_availability,
      weight: 8 
    },
    { 
      name: 'スキル', 
      value: profile.cfo_skills && profile.cfo_skills.length > 0,
      weight: 15 
    },
    { 
      name: '経歴', 
      value: profile.cfo_raw_profile,
      weight: 15 
    },
    { 
      name: '想定報酬', 
      value: profile.cfo_compensation,
      weight: 12 
    },
    { 
      name: '可能な業務詳細', 
      value: profile.cfo_possible_tasks,
      weight: 10 
    },
    { 
      name: '保有資格', 
      value: profile.cfo_certifications,
      weight: 7 
    },
    { 
      name: '対応可能エリア', 
      value: profile.cfo_working_areas,
      weight: 10 
    },
    { 
      name: '紹介文', 
      value: profile.cfo_introduction,
      weight: 10 
    }
  ]
  
  const completedFields = []
  const missingFields = []
  
  fields.forEach(field => {
    const isCompleted = field.value && field.value !== '' && field.value !== null
    
    if (isCompleted) {
      completedFields.push({
        name: field.name,
        status: typeof field.value === 'string' ? 
          (field.value.length > 50 ? '充実' : '基本') : 
          '設定済み'
      })
    } else {
      missingFields.push({
        name: field.name,
        status: '未設定'
      })
    }
  })
  
  const completed = completedFields.length
  const total = fields.length
  const percentage = Math.round((completed / total) * 100)
  
  return {
    percentage,
    completed,
    total,
    completedFields,
    missingFields
  }
}

/**
 * cfo_data.mdとの対応状況をチェック
 */
function checkCfoDataMapping(profile) {
  return {
    '名前': {
      mapped: !!profile.cfo_name,
      description: profile.cfo_name ? `"${profile.cfo_name}"として格納` : '未設定'
    },
    '居住地': {
      mapped: !!profile.cfo_location,
      description: profile.cfo_location ? `"${profile.cfo_location}"として格納` : '未設定'
    },
    '稼働可能時間': {
      mapped: !!profile.cfo_availability,
      description: profile.cfo_availability ? '設定済み' : '未設定'
    },
    '経歴': {
      mapped: !!profile.cfo_raw_profile,
      description: profile.cfo_raw_profile ? `${profile.cfo_raw_profile.length}文字の詳細経歴` : '未設定'
    },
    '可能な業務': {
      mapped: !!profile.cfo_possible_tasks,
      description: profile.cfo_possible_tasks ? '専用カラムに格納済み' : 'スキルタグのみ'
    },
    '想定月額報酬': {
      mapped: !!profile.cfo_compensation,
      description: profile.cfo_compensation ? '専用カラムに格納済み' : '未設定'
    },
    '対応可能エリア': {
      mapped: !!profile.cfo_working_areas,
      description: profile.cfo_working_areas ? '専用カラムに格納済み' : '未設定'
    },
    '紹介文': {
      mapped: !!profile.cfo_introduction,
      description: profile.cfo_introduction ? '専用カラムに格納済み' : '未設定'
    }
  }
}

// 実行
if (require.main === module) {
  simulateProfileDisplay()
}

module.exports = { simulateProfileDisplay }