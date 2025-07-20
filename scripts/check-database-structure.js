#!/usr/bin/env node

/**
 * データベースの構造を確認するスクリプト
 * テーブル一覧とプロフィール関連テーブルの構造を調査
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

async function checkDatabaseStructure() {
  console.log('🔍 データベース構造を確認中...\n')

  try {
    // テーブル一覧を取得
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError)
      // 代替方法でテーブルを確認
      console.log('📋 代替方法でテーブル確認を試行中...')
      
      // 既知のテーブル名で試行
      const knownTables = ['users', 'user_profiles', 'cfo_profiles', 'company_profiles', 'profiles']
      
      for (const tableName of knownTables) {
        try {
          const { data, error } = await supabase.from(tableName).select('*').limit(1)
          if (!error) {
            console.log(`✅ テーブル発見: ${tableName}`)
            
            // テーブルの列構造を確認
            const { data: sample, error: sampleError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1)
            
            if (!sampleError && sample && sample.length > 0) {
              console.log(`  カラム例: ${Object.keys(sample[0]).join(', ')}`)
            }
          }
        } catch (err) {
          // テーブルが存在しない場合はスキップ
        }
      }
      return
    }

    console.log('📋 データベース内のテーブル一覧:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })

    // プロフィール関連テーブルを特定
    const profileTables = tables.filter(t => 
      t.table_name.includes('profile') || 
      t.table_name.includes('user') ||
      t.table_name.includes('cfo') ||
      t.table_name.includes('company')
    )

    console.log('\n🎯 プロフィール関連テーブル:')
    
    for (const table of profileTables) {
      try {
        const { data: sample, error } = await supabase
          .from(table.table_name)
          .select('*')
          .limit(1)
        
        if (!error) {
          console.log(`\n📊 ${table.table_name}:`)
          if (sample && sample.length > 0) {
            console.log(`  カラム: ${Object.keys(sample[0]).join(', ')}`)
            
            // レコード数も確認
            const { count, error: countError } = await supabase
              .from(table.table_name)
              .select('*', { count: 'exact', head: true })
            
            if (!countError) {
              console.log(`  レコード数: ${count}件`)
            }
          } else {
            console.log(`  データなし`)
          }
        }
      } catch (err) {
        console.log(`  エラー: ${err.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Error during database check:', error)
  }
}

// スクリプト実行
checkDatabaseStructure()