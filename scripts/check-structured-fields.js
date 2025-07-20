#!/usr/bin/env node

/**
 * 構造化フィールドの現状確認スクリプト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkStructuredFields() {
  console.log('🔍 構造化フィールドの現状をチェック中...\n')
  
  try {
    // CFOプロフィールの構造化フィールドを取得
    const { data: profiles, error } = await supabase
      .from('cfo_profiles')
      .select(`
        cfo_user_id,
        cfo_name,
        compensation_type,
        monthly_fee_min,
        monthly_fee_max,
        weekly_days,
        weekly_days_flexible,
        cfo_experience_years,
        cfo_level,
        supported_prefectures,
        full_remote_available,
        industry_experience,
        company_size_experience,
        project_experience,
        work_styles
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ データ取得エラー:', error)
      return
    }
    
    console.log(`📊 総CFOプロフィール数: ${profiles.length}\n`)
    
    // 統計情報
    const stats = {
      total: profiles.length,
      hasCompensationType: 0,
      hasMonthlyFee: 0,
      hasWeeklyDays: 0,
      hasCfoLevel: 0,
      hasExperienceYears: 0,
      hasSupportedPrefectures: 0,
      hasFullRemoteAvailable: 0,
      hasIndustryExperience: 0,
      hasCompanySizeExperience: 0,
      hasProjectExperience: 0,
      hasWorkStyles: 0
    }
    
    // 各CFOの構造化フィールド状況をチェック
    profiles.forEach((profile, index) => {
      console.log(`--- CFO ${index + 1}: ${profile.cfo_name} (${profile.cfo_user_id}) ---`)
      
      // 報酬関連
      if (profile.compensation_type) {
        stats.hasCompensationType++
        console.log(`💰 報酬タイプ: ${profile.compensation_type}`)
      }
      
      if (profile.monthly_fee_min || profile.monthly_fee_max) {
        stats.hasMonthlyFee++
        const min = profile.monthly_fee_min ? `${Math.floor(profile.monthly_fee_min / 10000)}万円` : '未設定'
        const max = profile.monthly_fee_max ? `${Math.floor(profile.monthly_fee_max / 10000)}万円` : '未設定'
        console.log(`💰 月額: ${min} 〜 ${max}`)
      }
      
      // 稼働条件
      if (profile.weekly_days) {
        stats.hasWeeklyDays++
        console.log(`⏰ 週稼働: ${profile.weekly_days}日${profile.weekly_days_flexible ? ' (応相談)' : ''}`)
      }
      
      // 経験・レベル
      if (profile.cfo_experience_years) {
        stats.hasExperienceYears++
        console.log(`📈 CFO経験: ${profile.cfo_experience_years}年`)
      }
      
      if (profile.cfo_level) {
        stats.hasCfoLevel++
        console.log(`🎯 CFOレベル: ${profile.cfo_level}`)
      }
      
      // 地域対応
      if (profile.supported_prefectures && profile.supported_prefectures.length > 0) {
        stats.hasSupportedPrefectures++
        console.log(`🗺️ 対応エリア: ${JSON.stringify(profile.supported_prefectures)}`)
      }
      
      if (profile.full_remote_available) {
        stats.hasFullRemoteAvailable++
        console.log(`🏠 フルリモート: 対応可`)
      }
      
      // 経験詳細
      if (profile.industry_experience && profile.industry_experience.length > 0) {
        stats.hasIndustryExperience++
        console.log(`🏭 業界経験: ${JSON.stringify(profile.industry_experience)}`)
      }
      
      if (profile.company_size_experience && profile.company_size_experience.length > 0) {
        stats.hasCompanySizeExperience++
        console.log(`🏢 企業規模: ${JSON.stringify(profile.company_size_experience)}`)
      }
      
      if (profile.project_experience && profile.project_experience.length > 0) {
        stats.hasProjectExperience++
        console.log(`📋 プロジェクト: ${JSON.stringify(profile.project_experience)}`)
      }
      
      if (profile.work_styles && profile.work_styles.length > 0) {
        stats.hasWorkStyles++
        console.log(`💼 稼働形態: ${JSON.stringify(profile.work_styles)}`)
      }
      
      console.log('')
    })
    
    // 統計サマリー
    console.log('📈 構造化フィールド設定率:')
    console.log(`   報酬タイプ設定: ${stats.hasCompensationType}/${stats.total} (${Math.round(stats.hasCompensationType/stats.total*100)}%)`)
    console.log(`   月額報酬設定: ${stats.hasMonthlyFee}/${stats.total} (${Math.round(stats.hasMonthlyFee/stats.total*100)}%)`)
    console.log(`   週稼働日設定: ${stats.hasWeeklyDays}/${stats.total} (${Math.round(stats.hasWeeklyDays/stats.total*100)}%)`)
    console.log(`   CFOレベル設定: ${stats.hasCfoLevel}/${stats.total} (${Math.round(stats.hasCfoLevel/stats.total*100)}%)`)
    console.log(`   CFO経験年数: ${stats.hasExperienceYears}/${stats.total} (${Math.round(stats.hasExperienceYears/stats.total*100)}%)`)
    console.log(`   対応エリア設定: ${stats.hasSupportedPrefectures}/${stats.total} (${Math.round(stats.hasSupportedPrefectures/stats.total*100)}%)`)
    console.log(`   リモート対応: ${stats.hasFullRemoteAvailable}/${stats.total} (${Math.round(stats.hasFullRemoteAvailable/stats.total*100)}%)`)
    console.log(`   業界経験設定: ${stats.hasIndustryExperience}/${stats.total} (${Math.round(stats.hasIndustryExperience/stats.total*100)}%)`)
    console.log(`   企業規模経験: ${stats.hasCompanySizeExperience}/${stats.total} (${Math.round(stats.hasCompanySizeExperience/stats.total*100)}%)`)
    console.log(`   プロジェクト経験: ${stats.hasProjectExperience}/${stats.total} (${Math.round(stats.hasProjectExperience/stats.total*100)}%)`)
    console.log(`   稼働形態設定: ${stats.hasWorkStyles}/${stats.total} (${Math.round(stats.hasWorkStyles/stats.total*100)}%)`)
    
    // 改善提案
    console.log('\n🔧 改善提案:')
    if (stats.hasCompensationType === 0) {
      console.log('   - 報酬タイプの構造化が必要')
    }
    if (stats.hasWeeklyDays === 0) {
      console.log('   - 週稼働日数の構造化が必要')  
    }
    if (stats.hasCfoLevel === 0) {
      console.log('   - CFOレベルの設定が必要')
    }
    if (stats.hasSupportedPrefectures === 0) {
      console.log('   - 対応エリアの構造化が必要')
    }
    
    const structuredFieldsEmpty = stats.hasCompensationType === 0 && 
                                  stats.hasWeeklyDays === 0 && 
                                  stats.hasCfoLevel === 0 && 
                                  stats.hasSupportedPrefectures === 0
    
    if (structuredFieldsEmpty) {
      console.log('\n❗ 構造化フィールドがほぼ空の状態です')
      console.log('   → 既存データから構造化フィールドへの移行スクリプトの実行を推奨します')
    } else {
      console.log('\n✅ 一部の構造化フィールドは設定済みです')
    }
    
  } catch (error) {
    console.error('❌ チェック処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  checkStructuredFields()
}

module.exports = { checkStructuredFields }