#!/usr/bin/env node

// biz_profilesテーブルの実際のデータ内容を詳しく調査するスクリプト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function investigateBizProfilesData() {
  console.log('🔍 biz_profilesテーブルのデータ調査開始...\n')
  
  try {
    // 1. テーブル構造確認
    console.log('📋 1. テーブル構造確認:')
    const { data: tableInfo } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'biz_profiles')
      .order('ordinal_position')
    
    console.log('テーブル構造:')
    tableInfo?.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
    })
    
    // 2. 全データ件数確認
    console.log('\n📊 2. データ件数確認:')
    const { count } = await supabase
      .from('biz_profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log(`総レコード数: ${count}件`)
    
    // 3. 実際のデータ取得（最初の3件）
    console.log('\n📄 3. 実際のデータ内容（最初の3件）:')
    const { data: profiles, error } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('データ取得エラー:', error)
      return
    }
    
    profiles?.forEach((profile, index) => {
      console.log(`\n--- レコード ${index + 1} ---`)
      console.log(`ID: ${profile.biz_user_id}`)
      console.log(`会社名: ${profile.biz_company_name}`)
      console.log(`場所: ${profile.biz_location}`)
      console.log(`年商最小: ${profile.biz_revenue_min}`)
      console.log(`年商最大: ${profile.biz_revenue_max}`)
      console.log(`課題: ${JSON.stringify(profile.biz_issues)}`)
      console.log(`プロフィール（最初の200文字）: ${profile.biz_raw_profile ? profile.biz_raw_profile.substring(0, 200) + '...' : 'null'}`)
      console.log(`アバターURL: ${profile.avatar_url}`)
      console.log(`作成日: ${profile.created_at}`)
      console.log(`更新日: ${profile.updated_at}`)
    })
    
    // 4. biz_raw_profileフィールドの型確認
    console.log('\n🔍 4. biz_raw_profileフィールドの詳細分析:')
    const { data: rawProfiles } = await supabase
      .from('biz_profiles')
      .select('biz_user_id, biz_company_name, biz_raw_profile')
      .limit(5)
    
    rawProfiles?.forEach((profile, index) => {
      console.log(`\n--- biz_raw_profile 分析 ${index + 1} ---`)
      console.log(`会社名: ${profile.biz_company_name}`)
      console.log(`プロフィールのデータ型: ${typeof profile.biz_raw_profile}`)
      
      if (profile.biz_raw_profile) {
        console.log(`プロフィール内容（最初の300文字）:`)
        console.log(profile.biz_raw_profile.substring(0, 300))
        
        // JSON形式かどうか確認
        try {
          const parsed = JSON.parse(profile.biz_raw_profile)
          console.log('✅ JSON形式として解析可能')
          console.log('JSONキー:', Object.keys(parsed))
        } catch (e) {
          console.log('❌ JSON形式ではない（プレーンテキスト）')
        }
      } else {
        console.log('プロフィール内容: null')
      }
    })
    
    // 5. 年商データの分析
    console.log('\n💰 5. 年商データの分析:')
    const { data: revenueData } = await supabase
      .from('biz_profiles')
      .select('biz_user_id, biz_company_name, biz_revenue_min, biz_revenue_max')
      .not('biz_revenue_min', 'is', null)
      .limit(10)
    
    console.log('年商データが設定されている企業:')
    revenueData?.forEach(company => {
      const minStr = company.biz_revenue_min ? (company.biz_revenue_min / 100000000).toFixed(1) + '億円' : 'null'
      const maxStr = company.biz_revenue_max ? (company.biz_revenue_max / 100000000).toFixed(1) + '億円' : 'null'
      console.log(`  ${company.biz_company_name}: ${minStr} - ${maxStr}`)
    })
    
    // 6. null値の分析
    console.log('\n🔍 6. null値の分析:')
    const { data: nullAnalysis } = await supabase
      .from('biz_profiles')
      .select('biz_user_id')
      .is('biz_company_name', null)
    console.log(`会社名がnullのレコード: ${nullAnalysis?.length || 0}件`)
    
    const { data: nullRevenue } = await supabase
      .from('biz_profiles')
      .select('biz_user_id')
      .is('biz_revenue_min', null)
    console.log(`年商最小がnullのレコード: ${nullRevenue?.length || 0}件`)
    
    const { data: nullProfile } = await supabase
      .from('biz_profiles')
      .select('biz_user_id')
      .is('biz_raw_profile', null)
    console.log(`プロフィールがnullのレコード: ${nullProfile?.length || 0}件`)
    
  } catch (error) {
    console.error('🚨 調査中にエラーが発生:', error)
  }
}

if (require.main === module) {
  investigateBizProfilesData()
}

module.exports = { investigateBizProfilesData }