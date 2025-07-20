#!/usr/bin/env node

/**
 * 実際に存在する構造化フィールドの現状確認スクリプト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkExistingStructuredFields() {
  console.log('🔍 実際に存在する構造化フィールドの現状をチェック中...\n')
  
  try {
    // 実際に存在するフィールドのみを取得
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
        supported_prefectures,
        full_remote_available,
        cfo_compensation,
        cfo_availability,
        cfo_location,
        cfo_skills
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
      hasSupportedPrefectures: 0,
      hasFullRemoteAvailable: 0
    }
    
    // 各CFOの構造化フィールド状況をチェック
    profiles.forEach((profile, index) => {
      console.log(`--- CFO ${index + 1}: ${profile.cfo_name} ---`)
      
      // 既存のテキストデータ
      console.log(`📍 場所: ${profile.cfo_location || '未設定'}`)
      console.log(`⏰ 稼働: ${profile.cfo_availability || '未設定'}`)
      console.log(`💰 報酬（テキスト）: ${profile.cfo_compensation || '未設定'}`)
      console.log(`🎯 スキル数: ${profile.cfo_skills ? profile.cfo_skills.length : 0}`)
      
      // 構造化データ
      console.log('\n🆕 構造化フィールド:')
      
      if (profile.compensation_type) {
        stats.hasCompensationType++
        console.log(`   💰 報酬タイプ: ${profile.compensation_type}`)
      } else {
        console.log(`   💰 報酬タイプ: 未設定`)
      }
      
      if (profile.monthly_fee_min || profile.monthly_fee_max) {
        stats.hasMonthlyFee++
        const min = profile.monthly_fee_min ? `${Math.floor(profile.monthly_fee_min / 10000)}万円` : '未設定'
        const max = profile.monthly_fee_max ? `${Math.floor(profile.monthly_fee_max / 10000)}万円` : '未設定'
        console.log(`   💰 月額: ${min} 〜 ${max}`)
      } else {
        console.log(`   💰 月額: 未設定`)
      }
      
      if (profile.weekly_days) {
        stats.hasWeeklyDays++
        console.log(`   ⏰ 週稼働: ${profile.weekly_days}日${profile.weekly_days_flexible ? ' (応相談)' : ''}`)
      } else {
        console.log(`   ⏰ 週稼働: 未設定`)
      }
      
      if (profile.supported_prefectures && profile.supported_prefectures.length > 0) {
        stats.hasSupportedPrefectures++
        console.log(`   🗺️ 対応エリア: ${JSON.stringify(profile.supported_prefectures)}`)
      } else {
        console.log(`   🗺️ 対応エリア: 未設定`)
      }
      
      if (profile.full_remote_available) {
        stats.hasFullRemoteAvailable++
        console.log(`   🏠 フルリモート: 対応可`)
      } else {
        console.log(`   🏠 フルリモート: 未設定`)
      }
      
      console.log('')
    })
    
    // 統計サマリー
    console.log('📈 構造化フィールド設定率:')
    console.log(`   報酬タイプ設定: ${stats.hasCompensationType}/${stats.total} (${Math.round(stats.hasCompensationType/stats.total*100)}%)`)
    console.log(`   月額報酬設定: ${stats.hasMonthlyFee}/${stats.total} (${Math.round(stats.hasMonthlyFee/stats.total*100)}%)`)
    console.log(`   週稼働日設定: ${stats.hasWeeklyDays}/${stats.total} (${Math.round(stats.hasWeeklyDays/stats.total*100)}%)`)
    console.log(`   対応エリア設定: ${stats.hasSupportedPrefectures}/${stats.total} (${Math.round(stats.hasSupportedPrefectures/stats.total*100)}%)`)
    console.log(`   リモート対応: ${stats.hasFullRemoteAvailable}/${stats.total} (${Math.round(stats.hasFullRemoteAvailable/stats.total*100)}%)`)
    
    // 改善提案
    console.log('\n🔧 検索機能に関する問題点:')
    
    const structuredEmpty = stats.hasCompensationType === 0 && 
                           stats.hasWeeklyDays === 0 && 
                           stats.hasSupportedPrefectures === 0
    
    if (structuredEmpty) {
      console.log('❗ 【重大な問題】構造化フィールドがほぼ空です！')
      console.log('   → 現在の検索機能では以下の問題があります:')
      console.log('     - 報酬による絞り込みができない')
      console.log('     - 稼働条件による絞り込みができない')
      console.log('     - エリアによる絞り込みができない')
      console.log('     - テキスト検索しか利用できない状態')
    } else {
      console.log('✅ 一部の構造化フィールドは設定済みです')
    }
    
    console.log('\n💡 改善提案:')
    console.log('1. 既存のテキストデータから構造化フィールドへの移行')
    console.log('2. プロフィール編集画面での構造化データ入力機能の強化')
    console.log('3. 検索APIでの構造化フィールド活用の強化')
    console.log('4. フロントエンドでの詳細フィルター機能の実装')
    
  } catch (error) {
    console.error('❌ チェック処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  checkExistingStructuredFields()
}

module.exports = { checkExistingStructuredFields }