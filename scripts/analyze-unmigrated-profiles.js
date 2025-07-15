#!/usr/bin/env node

/**
 * 移行されていないCFOプロフィールの詳細分析
 * JSON形式データの手動構造化のための詳細調査
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function analyzeUnmigratedProfiles() {
  console.log('🔍 移行されていないCFOプロフィールの詳細分析...\n')
  
  try {
    // 新カラムが全て空のプロフィールを取得
    const { data: profiles, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .or('cfo_compensation.is.null,cfo_compensation.eq.')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ データ取得エラー:', error)
      return
    }
    
    const unmigratedProfiles = profiles.filter(profile => 
      !profile.cfo_compensation && 
      !profile.cfo_possible_tasks && 
      !profile.cfo_certifications && 
      !profile.cfo_working_areas && 
      !profile.cfo_introduction
    )
    
    console.log(`📊 移行未完了プロフィール数: ${unmigratedProfiles.length}`)
    
    unmigratedProfiles.forEach((profile, index) => {
      console.log(`\n=== プロフィール ${index + 1}: ${profile.cfo_user_id} ===`)
      console.log(`名前: ${profile.cfo_name}`)
      console.log(`表示名: ${profile.cfo_display_name}`)
      console.log(`場所: ${profile.cfo_location || '未設定'}`)
      console.log(`稼働: ${profile.cfo_availability || '未設定'}`)
      console.log(`スキル数: ${profile.cfo_skills ? profile.cfo_skills.length : 0}`)
      
      console.log('\n📝 Raw Profile 内容:')
      console.log('---開始---')
      console.log(profile.cfo_raw_profile || '(空)')
      console.log('---終了---')
      
      // データ形式の分析
      const rawProfile = profile.cfo_raw_profile || ''
      
      console.log('\n🔍 データ形式分析:')
      
      // JSON形式かチェック
      let isValidJSON = false
      let jsonData = null
      try {
        jsonData = JSON.parse(rawProfile)
        isValidJSON = true
        console.log('✅ JSON形式である')
        console.log('📋 JSONキー:', Object.keys(jsonData))
        
        // JSONの内容を詳細表示
        Object.entries(jsonData).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 100) {
            console.log(`   ${key}: ${value.substring(0, 100)}...`)
          } else {
            console.log(`   ${key}:`, value)
          }
        })
      } catch (e) {
        console.log('❌ JSON形式ではない')
      }
      
      // セクション分けかチェック
      const hasSections = rawProfile.includes('【') || rawProfile.includes('[')
      console.log(`${hasSections ? '✅' : '❌'} セクション分けあり`)
      
      // データ抽出可能性の評価
      console.log('\n💡 抽出可能性評価:')
      
      if (isValidJSON && jsonData) {
        console.log('🎯 JSON抽出戦略:')
        // JSONから抽出できそうなフィールドを特定
        const extractableFields = {
          compensation: jsonData.compensation || jsonData.salary || jsonData.fee || jsonData.monthlyFee,
          possibleTasks: jsonData.tasks || jsonData.skills || jsonData.services,
          certifications: jsonData.certifications || jsonData.qualifications,
          workingAreas: jsonData.areas || jsonData.locations || jsonData.regions,
          introduction: jsonData.introduction || jsonData.summary || jsonData.description
        }
        
        Object.entries(extractableFields).forEach(([field, value]) => {
          if (value) {
            console.log(`   ${field}: 抽出可能 - ${typeof value === 'string' ? value.substring(0, 50) + '...' : value}`)
          } else {
            console.log(`   ${field}: データなし`)
          }
        })
      }
      
      if (hasSections) {
        console.log('🎯 セクション抽出戦略:')
        const sections = ['想定月額報酬', '可能な業務', '保有資格', '対応可能エリア', '紹介文']
        sections.forEach(section => {
          const hasSection = rawProfile.includes(section) || rawProfile.includes(`【${section}】`) || rawProfile.includes(`[${section}]`)
          console.log(`   ${section}: ${hasSection ? '✅ あり' : '❌ なし'}`)
        })
      }
      
      // 推奨アプローチ
      console.log('\n🚀 推奨アプローチ:')
      if (isValidJSON) {
        console.log('   → JSONパーサーの改良による自動抽出')
      } else if (hasSections) {
        console.log('   → セクションパーサーの改良による自動抽出')
      } else {
        console.log('   → 手動でのデータ構造化が必要')
        console.log('   → または、現在の形式をそのまま経歴として使用')
      }
    })
    
    // 全体の方針提案
    console.log('\n' + '='.repeat(50))
    console.log('🎯 総合的な対応方針提案')
    console.log('='.repeat(50))
    
    const jsonProfiles = unmigratedProfiles.filter(p => {
      try {
        JSON.parse(p.cfo_raw_profile || '')
        return true
      } catch {
        return false
      }
    })
    
    const sectionProfiles = unmigratedProfiles.filter(p => {
      const raw = p.cfo_raw_profile || ''
      return !jsonProfiles.includes(p) && (raw.includes('【') || raw.includes('['))
    })
    
    const plainTextProfiles = unmigratedProfiles.filter(p => 
      !jsonProfiles.includes(p) && !sectionProfiles.includes(p)
    )
    
    console.log(`📊 分類結果:`)
    console.log(`   JSON形式: ${jsonProfiles.length}件`)
    console.log(`   セクション形式: ${sectionProfiles.length}件`)
    console.log(`   プレーンテキスト: ${plainTextProfiles.length}件`)
    
    console.log('\n📋 推奨対応:')
    if (jsonProfiles.length > 0) {
      console.log(`1. JSON形式(${jsonProfiles.length}件): 改良版JSONパーサーで自動移行`)
    }
    if (sectionProfiles.length > 0) {
      console.log(`2. セクション形式(${sectionProfiles.length}件): 改良版セクションパーサーで自動移行`)
    }
    if (plainTextProfiles.length > 0) {
      console.log(`3. プレーンテキスト(${plainTextProfiles.length}件): 現状維持または手動構造化`)
    }
    
  } catch (error) {
    console.error('❌ 分析処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  analyzeUnmigratedProfiles()
}

module.exports = { analyzeUnmigratedProfiles }