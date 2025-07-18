const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkLikesTable() {
  console.log('🔍 Checking likes table structure and data...')
  
  try {
    // テーブル構造の確認（Supabaseの方法）
    const { data: columns, error: columnError } = await supabase
      .rpc('get_column_info', { table_name: 'likes' })
    
    if (columnError) {
      console.log('📊 Likes table structure check (alternative method):')
      // サンプルデータから構造を推測
      const { data: sample } = await supabase
        .from('likes')
        .select('*')
        .limit(1)
      
      if (sample && sample.length > 0) {
        console.log('  Inferred from sample data:')
        Object.keys(sample[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof sample[0][key]}`)
        })
      }
    } else {
      console.log('📊 Likes table structure:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    // データの確認
    const { data: likes, error: dataError } = await supabase
      .from('likes')
      .select('*')
      .limit(10)
    
    if (dataError) {
      console.error('❌ Error checking table data:', dataError)
    } else {
      console.log(`\n📈 Found ${likes?.length || 0} likes records:`)
      likes?.forEach((like, index) => {
        console.log(`  ${index + 1}. liker: ${like.liker_id}, target: ${like.target_id}, created: ${like.created_at}`)
      })
    }
    
    // 外部キー制約の確認（省略 - Supabaseダッシュボードで確認）
    console.log('\n🔗 Table constraints: (check via Supabase dashboard)')
    
    // テスト用の重複挿入を試す
    console.log('\n🧪 Testing duplicate insertion...')
    // 既存のユーザーIDを使用
    const testUserId = '1276e9f8-4894-488b-8344-f6f46760af66'
    const testTargetId = '5ec75204-7974-47dc-82c1-40b3b2a0cee6'
    
    // 最初の挿入
    const { data: firstInsert, error: firstError } = await supabase
      .from('likes')
      .insert({ liker_id: testUserId, target_id: testTargetId })
      .select()
    
    if (firstError) {
      console.log('❌ First insertion failed:', firstError.message)
    } else {
      console.log('✅ First insertion succeeded')
      
      // 重複挿入を試す
      const { data: secondInsert, error: secondError } = await supabase
        .from('likes')
        .insert({ liker_id: testUserId, target_id: testTargetId })
        .select()
      
      if (secondError) {
        console.log('✅ Duplicate insertion properly rejected:', secondError.message)
      } else {
        console.log('❌ Duplicate insertion should have failed!')
      }
      
      // テストデータをクリーンアップ
      await supabase
        .from('likes')
        .delete()
        .eq('liker_id', testUserId)
        .eq('target_id', testTargetId)
      
      console.log('🧹 Test data cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkLikesTable()