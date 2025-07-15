#!/usr/bin/env node

/**
 * 改良版CFOプロフィール JSON→カラム移行スクリプト
 * 
 * JSON形式で保存されているプロフィールを対象とした
 * 強化された抽出ロジックによる自動移行
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateJsonProfilesEnhanced() {
  console.log('🚀 改良版CFOプロフィール JSON→カラム移行開始...')
  
  try {
    // 新カラムが全て空のプロフィールを取得
    const { data: profiles, error: fetchError } = await supabase
      .from('cfo_profiles')
      .select('*')
      .or('cfo_compensation.is.null,cfo_compensation.eq.')
      .not('cfo_raw_profile', 'is', null)
    
    if (fetchError) {
      console.error('❌ データ取得エラー:', fetchError)
      return
    }
    
    // 移行対象をフィルタリング（新カラムが全て空のもの）
    const targetProfiles = profiles.filter(profile => 
      !profile.cfo_compensation && 
      !profile.cfo_possible_tasks && 
      !profile.cfo_certifications && 
      !profile.cfo_working_areas && 
      !profile.cfo_introduction
    )
    
    console.log(`📊 移行対象プロフィール: ${targetProfiles.length}件`)
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const profile of targetProfiles) {
      const { cfo_user_id, cfo_raw_profile, cfo_name } = profile
      
      console.log(`\n🔍 処理中: ${cfo_name} (${cfo_user_id})`)
      
      // 改良版データ抽出
      const extractedData = extractDataFromRawProfileEnhanced(cfo_raw_profile, profile)
      
      console.log('📝 抽出結果:')
      console.log(`   報酬: ${extractedData.compensation ? '✅' : '❌'} "${extractedData.compensation}"`)
      console.log(`   業務: ${extractedData.possibleTasks ? '✅' : '❌'} "${extractedData.possibleTasks?.substring(0, 50)}..."`)
      console.log(`   資格: ${extractedData.certifications ? '✅' : '❌'} "${extractedData.certifications}"`)
      console.log(`   エリア: ${extractedData.workingAreas ? '✅' : '❌'} "${extractedData.workingAreas}"`)
      console.log(`   紹介文: ${extractedData.introduction ? '✅' : '❌'} "${extractedData.introduction?.substring(0, 50)}..."`)
      
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
            // 経歴部分のみをcfo_raw_profileに保存
            cfo_raw_profile: extractedData.cleanedExperience,
            updated_at: new Date().toISOString()
          })
          .eq('cfo_user_id', cfo_user_id)
        
        if (updateError) {
          console.error(`❌ 更新エラー (${cfo_user_id}):`, updateError)
        } else {
          console.log(`✅ 移行完了: ${cfo_name}`)
          migratedCount++
        }
      } else {
        console.log(`⏭️  スキップ: ${cfo_name} (抽出可能なデータなし)`)
        skippedCount++
      }
    }
    
    console.log('\n📊 改良版移行結果:')
    console.log(`   移行完了: ${migratedCount}件`)
    console.log(`   スキップ: ${skippedCount}件`)
    console.log(`   合計: ${targetProfiles.length}件`)
    
  } catch (error) {
    console.error('❌ 移行処理エラー:', error)
  }
}

/**
 * 改良版: cfo_raw_profileからデータを抽出
 */
function extractDataFromRawProfileEnhanced(rawProfile, profileInfo = {}) {
  if (!rawProfile || typeof rawProfile !== 'string') {
    return createEmptyResult()
  }
  
  let data = createEmptyResult()
  
  // JSON形式の解析
  if (rawProfile.trim().startsWith('{')) {
    try {
      const jsonData = JSON.parse(rawProfile)
      console.log('🔍 JSON解析成功:', Object.keys(jsonData))
      
      data = extractFromJson(jsonData, profileInfo)
      
    } catch (e) {
      console.log('⚠️ JSON解析失敗、テキスト解析にフォールバック')
      data = extractFromText(rawProfile)
    }
  } else {
    // テキスト形式の解析
    data = extractFromText(rawProfile)
  }
  
  return data
}

/**
 * JSON形式からの抽出（改良版）
 */
function extractFromJson(jsonData, profileInfo = {}) {
  const data = createEmptyResult()
  
  // 報酬情報の抽出
  data.compensation = jsonData.compensationRange || 
                     jsonData.compensation || 
                     jsonData.salary || 
                     jsonData.fee || 
                     ''
  
  // 可能な業務の抽出
  let tasks = []
  
  // スキル情報から業務を推定
  if (jsonData.skills) {
    if (typeof jsonData.skills === 'object') {
      tasks.push(...Object.keys(jsonData.skills))
    } else if (Array.isArray(jsonData.skills)) {
      tasks.push(...jsonData.skills)
    }
  }
  
  // experienceから主要業務を抽出
  if (jsonData.experience) {
    const experience = jsonData.experience
    const businessKeywords = [
      'M&A', 'IPO', '資金調達', '海外', 'USでのIPO', 
      '不動産', 'コンサルティング', '投資', '事業売却',
      '上場', '財務', '経理', 'CFO'
    ]
    
    businessKeywords.forEach(keyword => {
      if (experience.includes(keyword) && !tasks.includes(keyword)) {
        tasks.push(keyword)
      }
    })
  }
  
  data.possibleTasks = tasks.length > 0 ? tasks.join('・') : ''
  
  // 資格情報（JSONにはない場合が多いので空のまま）
  data.certifications = jsonData.certifications || 
                       jsonData.qualifications || 
                       ''
  
  // 対応エリア
  data.workingAreas = jsonData.workingArea || 
                     jsonData.area || 
                     jsonData.location || 
                     (jsonData.workPreference === 'flexible' ? '応相談（臨機応変に対応）' : '')
  
  // 紹介文の生成（experienceから要約を作成）
  if (jsonData.experience) {
    data.introduction = generateIntroductionFromExperience(jsonData.experience)
  }
  
  // 経歴のクリーンアップ
  data.cleanedExperience = jsonData.experience || ''
  
  return data
}

/**
 * 経験から紹介文を生成
 */
function generateIntroductionFromExperience(experience) {
  const highlights = []
  
  // M&A経験
  if (experience.includes('M&A') || experience.includes('売却')) {
    const maCount = (experience.match(/M&A|売却/g) || []).length
    if (maCount >= 2) {
      highlights.push(`M&A実績${maCount}件（売却経験含む）`)
    } else {
      highlights.push('M&A経験あり')
    }
  }
  
  // 海外経験
  if (experience.includes('海外') || experience.includes('フィリピン') || experience.includes('US')) {
    highlights.push('海外事業経験豊富')
  }
  
  // IPO経験
  if (experience.includes('IPO') || experience.includes('上場')) {
    highlights.push('IPO・上場支援経験')
  }
  
  // 起業経験
  const companyCount = (experience.match(/設立|起業/g) || []).length
  if (companyCount >= 2) {
    highlights.push(`起業経験${companyCount}回`)
  } else if (companyCount >= 1) {
    highlights.push('起業経験あり')
  }
  
  // 投資・不動産経験
  if (experience.includes('投資') || experience.includes('不動産')) {
    highlights.push('投資・不動産事業経験')
  }
  
  return highlights.length > 0 ? highlights.join('。') + '。' : ''
}

/**
 * テキスト形式からの抽出
 */
function extractFromText(rawProfile) {
  const data = createEmptyResult()
  
  // セクションベースの抽出（既存ロジック）
  const sections = {
    compensation: ['【想定月額報酬】', '【報酬】', '想定報酬', '月額報酬'],
    possibleTasks: ['【可能な業務】', '【業務内容】', '可能な業務', '対応可能業務'],
    certifications: ['【保有資格】', '【資格】', '保有資格'],
    workingAreas: ['【対応可能エリア】', '【エリア】', '対応可能エリア', '勤務地'],
    introduction: ['【紹介文】', '【自己紹介】', '紹介文', '自己紹介']
  }
  
  for (const [key, patterns] of Object.entries(sections)) {
    for (const pattern of patterns) {
      const extracted = extractSectionData(rawProfile, pattern)
      if (extracted) {
        data[key] = extracted
        break
      }
    }
  }
  
  data.cleanedExperience = rawProfile
  
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
 * 空の結果オブジェクトを作成
 */
function createEmptyResult() {
  return {
    compensation: '',
    possibleTasks: '',
    certifications: '',
    workingAreas: '',
    introduction: '',
    cleanedExperience: ''
  }
}

/**
 * 抽出されたデータがあるかチェック
 */
function hasExtractedData(data) {
  return Object.values(data).some(value => value !== null && value !== '')
}

// 実行確認
async function confirmExecution() {
  console.log('⚡ 改良版CFOプロフィール JSON→カラム移行を実行します')
  console.log('   JSON形式のプロフィールを自動的に構造化します')
  console.log('   既存のデータは保護されます')
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('🚀 改良版移行を開始します...\n')
  
  await migrateJsonProfilesEnhanced()
}

// メイン実行
if (require.main === module) {
  confirmExecution()
}

module.exports = { migrateJsonProfilesEnhanced, extractDataFromRawProfileEnhanced }