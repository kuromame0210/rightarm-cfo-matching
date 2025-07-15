#!/usr/bin/env node

/**
 * CFOプロフィール JSON→カラム移行スクリプト
 * 
 * cfo_raw_profileフィールドから構造化データを抽出し、
 * 新しく追加した5つのTEXTカラムに移行する
 * 
 * 対象カラム:
 * - cfo_compensation (想定報酬詳細)
 * - cfo_possible_tasks (可能な業務)
 * - cfo_certifications (保有資格)
 * - cfo_working_areas (対応可能エリア)
 * - cfo_introduction (紹介文)
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateJsonToColumns() {
  console.log('🔄 CFOプロフィール JSON→カラム移行開始...')
  
  try {
    // 既存のCFOプロフィールデータを取得
    const { data: cfoProfiles, error: fetchError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_raw_profile')
      .not('cfo_raw_profile', 'is', null)
    
    if (fetchError) {
      console.error('❌ データ取得エラー:', fetchError)
      return
    }
    
    console.log(`📊 移行対象のCFOプロフィール: ${cfoProfiles.length}件`)
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const profile of cfoProfiles) {
      const { cfo_user_id, cfo_raw_profile } = profile
      
      console.log(`\n🔍 処理中: ${cfo_user_id}`)
      console.log(`📝 Raw Profile: ${cfo_raw_profile?.substring(0, 100)}...`)
      
      // データ抽出ロジック
      const extractedData = extractDataFromRawProfile(cfo_raw_profile)
      
      // 抽出されたデータがある場合のみ更新
      if (hasExtractedData(extractedData)) {
        const { data: updateResult, error: updateError } = await supabase
          .from('cfo_profiles')
          .update({
            cfo_compensation: extractedData.compensation,
            cfo_possible_tasks: extractedData.possibleTasks,
            cfo_certifications: extractedData.certifications,
            cfo_working_areas: extractedData.workingAreas,
            cfo_introduction: extractedData.introduction,
            updated_at: new Date().toISOString()
          })
          .eq('cfo_user_id', cfo_user_id)
        
        if (updateError) {
          console.error(`❌ 更新エラー (${cfo_user_id}):`, updateError)
        } else {
          console.log(`✅ 移行完了: ${cfo_user_id}`)
          console.log(`   報酬: ${extractedData.compensation ? '✅' : '❌'}`)
          console.log(`   業務: ${extractedData.possibleTasks ? '✅' : '❌'}`)
          console.log(`   資格: ${extractedData.certifications ? '✅' : '❌'}`)
          console.log(`   エリア: ${extractedData.workingAreas ? '✅' : '❌'}`)
          console.log(`   紹介文: ${extractedData.introduction ? '✅' : '❌'}`)
          migratedCount++
        }
      } else {
        console.log(`⏭️  スキップ: ${cfo_user_id} (抽出可能なデータなし)`)
        skippedCount++
      }
    }
    
    console.log('\n📊 移行結果:')
    console.log(`   移行完了: ${migratedCount}件`)
    console.log(`   スキップ: ${skippedCount}件`)
    console.log(`   合計: ${cfoProfiles.length}件`)
    
  } catch (error) {
    console.error('❌ 移行処理エラー:', error)
  }
}

/**
 * cfo_raw_profileからデータを抽出
 */
function extractDataFromRawProfile(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'string') {
    return {
      compensation: null,
      possibleTasks: null,
      certifications: null,
      workingAreas: null,
      introduction: null
    }
  }
  
  const data = {
    compensation: null,
    possibleTasks: null,
    certifications: null,
    workingAreas: null,
    introduction: null
  }
  
  // セクション区切りパターンを検索
  const sections = {
    compensation: ['【想定月額報酬】', '【報酬】', '想定報酬', '月額報酬'],
    possibleTasks: ['【可能な業務】', '【業務内容】', '可能な業務', '対応可能業務'],
    certifications: ['【保有資格】', '【資格】', '保有資格'],
    workingAreas: ['【対応可能エリア】', '【エリア】', '対応可能エリア', '勤務地'],
    introduction: ['【紹介文】', '【自己紹介】', '紹介文', '自己紹介']
  }
  
  // 各セクションのデータを抽出
  for (const [key, patterns] of Object.entries(sections)) {
    for (const pattern of patterns) {
      const extracted = extractSectionData(rawProfile, pattern)
      if (extracted) {
        data[key] = extracted
        break
      }
    }
  }
  
  // JSON形式のデータも確認（cfo_data.mdの例に基づく）
  try {
    const jsonMatch = rawProfile.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0])
      
      // JSON内のフィールドマッピング
      if (jsonData.compensation && !data.compensation) {
        data.compensation = jsonData.compensation
      }
      if (jsonData.possibleTasks && !data.possibleTasks) {
        data.possibleTasks = Array.isArray(jsonData.possibleTasks) 
          ? jsonData.possibleTasks.join('\n') 
          : jsonData.possibleTasks
      }
      if (jsonData.certifications && !data.certifications) {
        data.certifications = Array.isArray(jsonData.certifications)
          ? jsonData.certifications.join('\n')
          : jsonData.certifications
      }
      if (jsonData.workingAreas && !data.workingAreas) {
        data.workingAreas = Array.isArray(jsonData.workingAreas)
          ? jsonData.workingAreas.join('\n')
          : jsonData.workingAreas
      }
      if (jsonData.introduction && !data.introduction) {
        data.introduction = jsonData.introduction
      }
    }
  } catch (e) {
    // JSON解析失敗は無視
  }
  
  return data
}

/**
 * セクションデータを抽出
 */
function extractSectionData(text, sectionHeader) {
  const regex = new RegExp(`${sectionHeader}[\\s\\S]*?(?=【|$)`, 'i')
  const match = text.match(regex)
  
  if (match) {
    return match[0]
      .replace(new RegExp(sectionHeader, 'i'), '')
      .trim()
      .replace(/^[\n\r]+/, '')
      .replace(/[\n\r]+$/, '')
  }
  
  return null
}

/**
 * 抽出されたデータがあるかチェック
 */
function hasExtractedData(data) {
  return Object.values(data).some(value => value !== null && value !== '')
}

// 実行確認
async function confirmExecution() {
  console.log('⚠️  CFOプロフィール JSON→カラム移行を実行します')
  console.log('   この操作は既存のデータを変更します')
  console.log('   続行する場合は、Enterキーを押してください...')
  
  // 5秒待機してから実行
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log('🚀 移行を開始します...')
  
  await migrateJsonToColumns()
}

// メイン実行
if (require.main === module) {
  confirmExecution()
}

module.exports = { migrateJsonToColumns, extractDataFromRawProfile }