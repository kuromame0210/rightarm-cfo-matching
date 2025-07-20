#!/usr/bin/env node

/**
 * cfo_profilesテーブルのスキーマ確認スクリプト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTableSchema() {
  console.log('🔍 cfo_profilesテーブルのスキーマを確認中...\n')
  
  try {
    // まず単純にすべてのカラムを取得してみる
    const { data: sampleData, error: sampleError } = await supabase
      .from('cfo_profiles')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ サンプルデータ取得エラー:', sampleError)
      return
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('📋 実際のカラム一覧:')
      const columns = Object.keys(sampleData[0]).sort()
      columns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`)
      })
      
      console.log('\n🔍 構造化フィールドの確認:')
      const structuredFields = [
        'compensation_type',
        'monthly_fee_min', 
        'monthly_fee_max',
        'weekly_days',
        'weekly_days_flexible',
        'cfo_experience_years',
        'cfo_level',
        'supported_prefectures',
        'full_remote_available',
        'industry_experience',
        'company_size_experience',
        'project_experience',
        'work_styles'
      ]
      
      structuredFields.forEach(field => {
        const exists = columns.includes(field)
        console.log(`   ${exists ? '✅' : '❌'} ${field}`)
      })
      
      // 実際にあるフィールドのサンプルデータを表示
      console.log('\n📊 サンプルデータ:')
      const sampleRecord = sampleData[0]
      
      console.log(`   CFO名: ${sampleRecord.cfo_name || '未設定'}`)
      console.log(`   場所: ${sampleRecord.cfo_location || '未設定'}`)
      console.log(`   スキル: ${sampleRecord.cfo_skills ? JSON.stringify(sampleRecord.cfo_skills) : '未設定'}`)
      
      // 基本的な構造化フィールドのチェック
      const basicStructuredFields = columns.filter(col => 
        col.includes('compensation') || 
        col.includes('weekly') || 
        col.includes('monthly') ||
        col.includes('supported') ||
        col.includes('remote')
      )
      
      if (basicStructuredFields.length > 0) {
        console.log('\n🆕 構造化フィールド（実在）:')
        basicStructuredFields.forEach(field => {
          const value = sampleRecord[field]
          console.log(`   ${field}: ${value || 'NULL'}`)
        })
      }
      
    } else {
      console.log('❌ データが存在しません')
    }
    
  } catch (error) {
    console.error('❌ スキーマチェックエラー:', error)
  }
}

// 実行
if (require.main === module) {
  checkTableSchema()
}

module.exports = { checkTableSchema }