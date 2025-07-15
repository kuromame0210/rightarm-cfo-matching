#!/usr/bin/env node

/**
 * biz_profilesテーブルの現在のスキーマを確認するスクリプト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkBizProfilesSchema() {
  console.log('🔍 biz_profilesテーブルのスキーマを確認中...\n')
  
  try {
    // テーブルの構造を確認（PostgreSQLのinformation_schemaを使用）
    const { data: columns, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'biz_profiles' 
          ORDER BY ordinal_position;
        `
      })
    
    if (schemaError) {
      console.log('直接SQLが実行できません。既存データから構造を推測します...')
      
      // 既存データの1件を取得してカラム構造を確認
      const { data: sampleData, error: sampleError } = await supabase
        .from('biz_profiles')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.error('❌ サンプルデータ取得エラー:', sampleError)
        return
      }
      
      console.log('📊 テーブルカラム（サンプルデータから推測）:')
      if (sampleData && sampleData.length > 0) {
        Object.keys(sampleData[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof sampleData[0][column]}`)
        })
      } else {
        console.log('サンプルデータが存在しません')
      }
    } else {
      console.log('📊 テーブルスキーマ:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    // 特定のカラムの存在確認
    const targetColumns = ['biz_description', 'biz_revenue_range', 'biz_challenge_background']
    
    console.log('\n🔍 特定カラムの存在確認:')
    const { data: allData, error: allError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(1)
    
    if (allError) {
      console.error('❌ データ取得エラー:', allError)
      return
    }
    
    const existingColumns = allData && allData.length > 0 ? Object.keys(allData[0]) : []
    
    targetColumns.forEach(col => {
      const exists = existingColumns.includes(col)
      console.log(`  - ${col}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
    })
    
    // 既存データの数を確認
    const { count, error: countError } = await supabase
      .from('biz_profiles')
      .select('*', { count: 'exact', head: true })
    
    if (!countError) {
      console.log(`\n📈 既存データ数: ${count}件`)
    }
    
    // 既存データのサンプル表示
    const { data: samples, error: sampleError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(3)
    
    if (!sampleError && samples && samples.length > 0) {
      console.log('\n📋 既存データサンプル:')
      samples.forEach((sample, index) => {
        console.log(`\n  【サンプル ${index + 1}】`)
        console.log(`    biz_user_id: ${sample.biz_user_id}`)
        console.log(`    biz_company_name: ${sample.biz_company_name || '未設定'}`)
        console.log(`    biz_location: ${sample.biz_location || '未設定'}`)
        console.log(`    biz_revenue_min: ${sample.biz_revenue_min || '未設定'}`)
        console.log(`    biz_revenue_max: ${sample.biz_revenue_max || '未設定'}`)
        console.log(`    biz_issues: ${sample.biz_issues ? JSON.stringify(sample.biz_issues) : '未設定'}`)
        console.log(`    biz_raw_profile: ${sample.biz_raw_profile ? sample.biz_raw_profile.substring(0, 50) + '...' : '未設定'}`)
        
        // 特定カラムの値確認
        targetColumns.forEach(col => {
          if (sample[col] !== undefined) {
            console.log(`    ${col}: ${sample[col] || '未設定'}`)
          }
        })
      })
    }
    
  } catch (error) {
    console.error('❌ スキーマチェック処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  checkBizProfilesSchema()
}

module.exports = { checkBizProfilesSchema }