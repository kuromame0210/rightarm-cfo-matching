#!/usr/bin/env node

/**
 * NextAuth.jsのテーブルとユーザータイプを確認
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

async function checkNextAuthTables() {
  console.log('🔍 NextAuth.jsテーブルとユーザー情報を確認中...\n')

  // NextAuth.jsテーブル（大文字版）
  const nextAuthTables = [
    'Account', 'Session', 'User', 'VerificationToken',
    'accounts', 'sessions', 'users', 'verification_tokens'
  ]

  const existingTables = []

  for (const tableName of nextAuthTables) {
    try {
      console.log(`🔍 ${tableName} をチェック中...`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3)
      
      if (!error) {
        console.log(`✅ ${tableName} 存在確認`)
        existingTables.push(tableName)
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          console.log(`  カラム: ${columns.join(', ')}`)
          
          // user_typeやrole関連のカラムをチェック
          const userTypeColumns = columns.filter(col => 
            col.includes('user_type') || 
            col.includes('userType') ||
            col.includes('role') || 
            col.includes('type') ||
            col.includes('profile_setup') ||
            col.includes('profileSetup')
          )
          
          if (userTypeColumns.length > 0) {
            console.log(`  🎯 ユーザータイプ関連カラム: ${userTypeColumns.join(', ')}`)
            
            // 実際のデータ値を確認
            for (const record of data) {
              console.log(`  📋 レコード例:`)
              userTypeColumns.forEach(col => {
                if (record[col] !== null && record[col] !== undefined) {
                  console.log(`    ${col}: ${record[col]}`)
                }
              })
              
              // emailも表示（識別のため）
              if (record.email) {
                console.log(`    email: ${record.email}`)
              }
              console.log(`    id: ${record.id}`)
              console.log('    ---')
            }
          }
          
          // レコード数も確認
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          if (!countError) {
            console.log(`  📊 レコード数: ${count}件`)
          }
        } else {
          console.log(`  データなし`)
        }
        console.log('')
      }
    } catch (err) {
      // テーブルが存在しない場合はスキップ
    }
  }

  console.log('=' .repeat(50))
  console.log('📋 存在するNextAuth.jsテーブル:')
  existingTables.forEach(table => console.log(`  - ${table}`))

  // 特にUserテーブルの詳細確認
  if (existingTables.includes('User')) {
    console.log('\n🎯 Userテーブルの詳細確認:')
    try {
      const { data: allUsers, error } = await supabase
        .from('User')
        .select('*')
      
      if (!error && allUsers) {
        console.log(`全ユーザー数: ${allUsers.length}`)
        
        // userTypeの分布を確認
        const userTypeDistribution = allUsers.reduce((acc, user) => {
          const type = user.userType || 'null'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {})
        
        console.log('ユーザータイプ分布:')
        Object.entries(userTypeDistribution).forEach(([type, count]) => {
          console.log(`  ${type}: ${count}件`)
        })

        // profile_setup_requiredの分布も確認
        if (allUsers.some(u => 'profileSetupRequired' in u)) {
          const setupStats = allUsers.reduce((acc, user) => {
            const type = user.userType || 'null'
            if (!acc[type]) acc[type] = { total: 0, setupRequired: 0 }
            acc[type].total++
            if (user.profileSetupRequired) acc[type].setupRequired++
            return acc
          }, {})

          console.log('\nプロフィール作成必要状況:')
          Object.entries(setupStats).forEach(([type, stats]) => {
            console.log(`  ${type}: ${stats.setupRequired}/${stats.total} がプロフィール作成必要`)
          })
        }
      }
    } catch (err) {
      console.log('Userテーブル詳細確認エラー:', err.message)
    }
  }
}

// スクリプト実行
checkNextAuthTables()