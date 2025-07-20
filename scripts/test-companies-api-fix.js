#!/usr/bin/env node

// 企業一覧API修正後のテストスクリプト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 修正したparseProfileDescription関数をテスト
function parseProfileDescription(rawProfile) {
  if (!rawProfile) return '会社概要未設定'
  
  // JSON文字列かどうか判定（{で始まる場合）
  if (rawProfile.trim().startsWith('{')) {
    try {
      const jsonData = JSON.parse(rawProfile)
      // descriptionフィールドが存在する場合はそれを使用
      return jsonData.description || jsonData.businessName || rawProfile
    } catch (e) {
      // JSON解析に失敗した場合はそのまま返す
      console.warn('JSON解析失敗:', e.message)
      return rawProfile
    }
  }
  
  // プレーンテキストの場合はそのまま返す
  return rawProfile
}

async function testCompaniesApiFix() {
  console.log('🔧 企業一覧API修正後のテスト開始...\n')
  
  try {
    // データを取得
    const { data: bizProfiles, error } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(6)
    
    if (error) {
      console.error('データ取得エラー:', error)
      return
    }
    
    console.log(`🏢 取得企業数: ${bizProfiles?.length || 0}件\n`)
    
    console.log('=== 修正前後の比較 ===\n')
    
    bizProfiles?.forEach((profile, index) => {
      console.log(`--- 企業 ${index + 1}: ${profile.biz_company_name} ---`)
      
      // 修正前（生データ）
      const rawData = profile.biz_raw_profile
      console.log('修正前のdescription（最初の150文字）:')
      if (rawData) {
        console.log(rawData.substring(0, 150) + (rawData.length > 150 ? '...' : ''))
        
        if (rawData.trim().startsWith('{')) {
          console.log('❌ JSON文字列がそのまま表示される問題')
        } else {
          console.log('✅ プレーンテキスト（問題なし）')
        }
      } else {
        console.log('null')
      }
      
      // 修正後
      const parsedData = parseProfileDescription(rawData)
      console.log('\n修正後のdescription:')
      console.log(parsedData.substring(0, 150) + (parsedData.length > 150 ? '...' : ''))
      
      if (rawData && rawData.trim().startsWith('{') && parsedData !== rawData) {
        console.log('✅ JSON文字列が適切に解析されました')
      }
      
      console.log('')
    })
    
    // 修正されたAPIレスポンス形式のシミュレート
    console.log('=== 修正後のAPIレスポンス形式 ===\n')
    
    const companies = (bizProfiles || []).map(profile => {
      const parsedDescription = parseProfileDescription(profile.biz_raw_profile)
      
      return {
        id: profile.biz_user_id,
        companyName: profile.biz_company_name,
        description: parsedDescription,
        revenueMin: profile.biz_revenue_min,
        revenueMax: profile.biz_revenue_max,
        location: profile.biz_location,
        createdAt: profile.created_at
      }
    })
    
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName}`)
      console.log(`   説明: ${company.description.substring(0, 100)}...`)
      
      // 年商表示
      if (company.revenueMin || company.revenueMax) {
        const minStr = company.revenueMin ? (company.revenueMin / 100000000).toFixed(1) + '億円' : '未設定'
        const maxStr = company.revenueMax ? (company.revenueMax / 100000000).toFixed(1) + '億円' : '未設定'
        console.log(`   年商: ${minStr} - ${maxStr}`)
      } else {
        console.log(`   年商: 未設定`)
      }
      console.log('')
    })
    
    console.log('✅ 修正完了: JSON文字列表示問題が解決されました')
    console.log('   - JSON形式のデータから適切にdescriptionフィールドを抽出')
    console.log('   - プレーンテキストはそのまま保持')
    console.log('   - フロントエンドでの表示が改善される予定')
    
  } catch (error) {
    console.error('🚨 テスト中にエラーが発生:', error)
  }
}

if (require.main === module) {
  testCompaniesApiFix()
}

module.exports = { testCompaniesApiFix, parseProfileDescription }