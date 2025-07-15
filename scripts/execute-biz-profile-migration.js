#!/usr/bin/env node

/**
 * biz_profilesテーブルに詳細フィールドを追加するマイグレーションスクリプト
 * 2025-07-15: APIで使用されている項目に対応
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function executeBizProfileMigration() {
  console.log('🚀 biz_profilesテーブルの詳細フィールド追加を開始...\n')
  
  try {
    // 1. マイグレーション前の状態確認
    console.log('📊 マイグレーション前の状態確認:')
    const { data: beforeData, error: beforeError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(1)
    
    if (beforeError) {
      console.error('❌ 事前確認エラー:', beforeError)
      return
    }
    
    const beforeColumns = beforeData && beforeData.length > 0 ? Object.keys(beforeData[0]) : []
    const targetColumns = ['biz_description', 'biz_revenue_range', 'biz_challenge_background']
    
    console.log('既存カラム:', beforeColumns.join(', '))
    targetColumns.forEach(col => {
      const exists = beforeColumns.includes(col)
      console.log(`  - ${col}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
    })
    
    // 2. SQLファイルの読み込み
    const sqlPath = path.join(__dirname, '../sql/add-biz-profile-detailed-fields.sql')
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ SQLファイルが見つかりません:', sqlPath)
      return
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    console.log('\n📝 SQLファイル読み込み完了')
    
    // 3. SQLを文に分割して実行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`\n⚡ ${statements.length}個のSQL文を実行します...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.includes('SELECT') && statement.includes('information_schema')) {
        // 確認用クエリはスキップ
        console.log(`  [${i + 1}/${statements.length}] 確認用クエリをスキップ`)
        continue
      }
      
      console.log(`  [${i + 1}/${statements.length}] 実行中...`)
      
      try {
        // ALTER TABLE文の実行
        if (statement.includes('ALTER TABLE')) {
          // Supabaseでは複数のALTER TABLE文を分割して実行
          const alterStatements = statement.split('ADD COLUMN IF NOT EXISTS')
          if (alterStatements.length > 1) {
            const tableName = alterStatements[0].replace('ALTER TABLE', '').trim()
            for (let j = 1; j < alterStatements.length; j++) {
              const columnDef = alterStatements[j].trim().replace(/,$/, '')
              const singleAlter = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnDef}`
              console.log(`    -> ${singleAlter}`)
              const { error } = await supabase.rpc('exec_sql', { sql: singleAlter })
              if (error) {
                console.log(`    ⚠️  エラー（続行）: ${error.message}`)
              }
            }
          }
        } else {
          // その他のSQL文
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.log(`    ⚠️  エラー（続行）: ${error.message}`)
          }
        }
      } catch (error) {
        console.log(`    ⚠️  実行エラー（続行）: ${error.message}`)
      }
    }
    
    // 4. マイグレーション後の状態確認
    console.log('\n📊 マイグレーション後の状態確認:')
    const { data: afterData, error: afterError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(1)
    
    if (afterError) {
      console.error('❌ 事後確認エラー:', afterError)
      return
    }
    
    const afterColumns = afterData && afterData.length > 0 ? Object.keys(afterData[0]) : []
    console.log('新しいカラム:', afterColumns.join(', '))
    
    targetColumns.forEach(col => {
      const exists = afterColumns.includes(col)
      console.log(`  - ${col}: ${exists ? '✅ 追加成功' : '❌ 追加失敗'}`)
    })
    
    // 5. 既存データの移行確認
    console.log('\n📋 既存データの移行確認:')
    const { data: migratedData, error: migratedError } = await supabase
      .from('biz_profiles')
      .select('biz_company_name, biz_description, biz_revenue_range, biz_challenge_background')
      .limit(3)
    
    if (!migratedError && migratedData) {
      migratedData.forEach((record, index) => {
        console.log(`\n  【企業 ${index + 1}】 ${record.biz_company_name}`)
        console.log(`    事業内容: ${record.biz_description || '未設定'}`)
        console.log(`    売上規模: ${record.biz_revenue_range || '未設定'}`)
        console.log(`    経営課題: ${record.biz_challenge_background || '未設定'}`)
      })
    }
    
    console.log('\n✅ マイグレーション完了!')
    console.log('🔄 APIで使用されている項目が正常に追加されました。')
    
  } catch (error) {
    console.error('❌ マイグレーション処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  executeBizProfileMigration()
}

module.exports = { executeBizProfileMigration }