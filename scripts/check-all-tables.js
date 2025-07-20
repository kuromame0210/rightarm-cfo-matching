#!/usr/bin/env node

/**
 * 全テーブルを確認してユーザータイプの格納場所を特定
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables not found')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAllTables() {
  console.log('🔍 全テーブルとユーザータイプの場所を確認中...\n')

  // 確認する可能性のあるテーブル名
  const possibleTables = [
    'users', 'profiles', 'user_profiles', 'auth.users',
    'cfo_profiles', 'company_profiles', 'scout_profiles',
    'user_types', 'accounts', 'sessions'
  ]

  const existingTables = []

  for (const tableName of possibleTables) {
    try {
      console.log(`🔍 ${tableName} をチェック中...`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(2)
      
      if (!error) {
        console.log(`✅ ${tableName} 存在確認`)
        existingTables.push(tableName)
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          console.log(`  カラム: ${columns.join(', ')}`)
          
          // user_typeやrole関連のカラムをチェック
          const userTypeColumns = columns.filter(col => 
            col.includes('user_type') || 
            col.includes('role') || 
            col.includes('type') ||
            col.includes('profile_setup')
          )
          
          if (userTypeColumns.length > 0) {
            console.log(`  🎯 ユーザータイプ関連カラム: ${userTypeColumns.join(', ')}`)
            
            // データの内容も確認
            for (const record of data) {
              userTypeColumns.forEach(col => {
                if (record[col] !== null && record[col] !== undefined) {
                  console.log(`    ${col}: ${record[col]}`)
                }
              })
            }
          }
          
          // レコード数も確認
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          if (!countError) {
            console.log(`  📊 レコード数: ${count}件`)
          }
        }
        console.log('')
      }
    } catch (err) {
      // テーブルが存在しない場合はスキップ
    }
  }

  console.log('=' .repeat(50))
  console.log('📋 存在するテーブル一覧:')
  existingTables.forEach(table => console.log(`  - ${table}`))

  // NextAuth.jsのテーブルも確認
  const nextAuthTables = ['Account', 'Session', 'User', 'VerificationToken']
  console.log('\n🔍 NextAuth.js関連テーブルも確認中...')
  
  for (const tableName of nextAuthTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`✅ ${tableName} 存在確認`)
        if (data && data.length > 0) {
          console.log(`  カラム: ${Object.keys(data[0]).join(', ')}`)
        }
      }
    } catch (err) {
      // スキップ
    }
  }
}

// スクリプト実行
checkAllTables()