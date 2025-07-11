// Supabase接続テストスクリプト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔗 Supabase接続テストを開始...')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey ? '設定済み' : '未設定')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    console.log('\n1️⃣ 接続テスト...')
    
    // Supabaseの基本接続テスト
    const { data, error } = await supabase
      .from('rextrix_users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ 接続エラー:', error.message)
      
      // テーブル存在確認
      console.log('\n2️⃣ テーブル存在確認...')
      const { data: tables, error: tableError } = await supabase
        .rpc('get_table_names')
        .select()
      
      if (tableError) {
        console.log('RPC関数が利用できません。直接クエリを試します...')
        
        // 直接SQLでテーブル一覧を取得
        const { data: tableList, error: sqlError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
        
        if (sqlError) {
          console.error('❌ テーブル確認エラー:', sqlError.message)
        } else {
          console.log('✅ 利用可能なテーブル:', tableList?.map(t => t.table_name) || [])
        }
      } else {
        console.log('✅ 利用可能なテーブル:', tables)
      }
    } else {
      console.log('✅ rextrix_usersテーブル接続成功')
      console.log('現在のレコード数:', data)
    }
    
    console.log('\n3️⃣ 各テーブルの存在確認...')
    const tablesToCheck = [
      'rextrix_users',
      'rextrix_user_profiles', 
      'rextrix_cfos',
      'rextrix_companies',
      'rextrix_skill_tags'
    ]
    
    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: ${count || 0}件`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: テーブルエラー`)
      }
    }
    
    console.log('\n4️⃣ 簡単なテストデータ挿入...')
    
    // テスト用のシンプルなデータ挿入
    const testData = {
      email: 'test@example.com',
      user_type: 'cfo',
      status: 'active',
      email_verified: true
    }
    
    const { data: insertResult, error: insertError } = await supabase
      .from('rextrix_users')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('❌ テストデータ挿入エラー:', insertError.message)
    } else {
      console.log('✅ テストデータ挿入成功:', insertResult)
      
      // 挿入したテストデータを削除
      if (insertResult && insertResult.length > 0) {
        const { error: deleteError } = await supabase
          .from('rextrix_users')
          .delete()
          .eq('id', insertResult[0].id)
        
        if (deleteError) {
          console.error('❌ テストデータ削除エラー:', deleteError.message)
        } else {
          console.log('✅ テストデータ削除成功')
        }
      }
    }
    
  } catch (error) {
    console.error('💥 予期しないエラー:', error)
  }
}

testConnection()
  .then(() => {
    console.log('\n🎯 接続テスト完了!')
  })
  .catch(console.error)