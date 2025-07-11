/**
 * 孤立データクリーンアップスクリプト
 * 参照先のないデータ（orphaned data）を削除します
 */

require('dotenv').config({ path: '.env.test' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupOrphanedData(dryRun = true) {
  console.log('🧹 孤立データクリーンアップ開始');
  console.log(dryRun ? '(ドライラン - 実際の削除は行いません)' : '(実際の削除を実行します)');
  
  try {
    // 存在するユーザーIDを取得
    const { data: validUsers, error: usersError } = await supabaseAdmin
      .from('rextrix_users')
      .select('id');
    
    if (usersError) {
      console.error('❌ ユーザー取得エラー:', usersError);
      return;
    }
    
    const validUserIds = validUsers.map(u => u.id);
    console.log(`\n✅ 有効なユーザー: ${validUserIds.length}件`);
    
    // 各関連テーブルの孤立データをチェック・削除
    const tables = [
      { name: 'rextrix_user_profiles', userColumn: 'user_id' },
      { name: 'rextrix_cfos', userColumn: 'user_id' },
      { name: 'rextrix_companies', userColumn: 'user_id' },
      { name: 'rextrix_activities', userColumn: 'user_id' }
    ];
    
    for (const table of tables) {
      console.log(`\n🔍 ${table.name} の孤立データをチェック中...`);
      
      // 孤立データを特定
      const { data: allRecords, error: fetchError } = await supabaseAdmin
        .from(table.name)
        .select(`id, ${table.userColumn}`);
        
      if (fetchError) {
        console.error(`❌ ${table.name} 取得エラー:`, fetchError);
        continue;
      }
      
      const orphanedRecords = allRecords?.filter(record => 
        !validUserIds.includes(record[table.userColumn])
      ) || [];
      
      console.log(`   📊 総データ数: ${allRecords?.length || 0}`);
      console.log(`   🚫 孤立データ: ${orphanedRecords.length}`);
      
      if (orphanedRecords.length === 0) {
        console.log(`   ✅ 孤立データなし`);
        continue;
      }
      
      if (dryRun) {
        console.log(`   💡 削除対象の孤立データ ID:`);
        orphanedRecords.slice(0, 5).forEach(record => {
          console.log(`      - ${record.id} (user_id: ${record[table.userColumn]})`);
        });
        if (orphanedRecords.length > 5) {
          console.log(`      ... および他${orphanedRecords.length - 5}件`);
        }
      } else {
        // 実際の削除実行
        const orphanedIds = orphanedRecords.map(r => r.id);
        const { error: deleteError } = await supabaseAdmin
          .from(table.name)
          .delete()
          .in('id', orphanedIds);
          
        if (deleteError) {
          console.error(`❌ ${table.name} 削除エラー:`, deleteError);
        } else {
          console.log(`   ✅ ${orphanedRecords.length}件の孤立データを削除`);
        }
      }
    }
    
    // 重複データのチェック（同じuser_idで複数レコード）
    console.log('\n🔍 重複データをチェック中...');
    
    for (const table of tables) {
      const { data: duplicates, error: dupError } = await supabaseAdmin
        .rpc('check_duplicates', { 
          table_name: table.name, 
          user_column: table.userColumn 
        })
        .then(() => null) // RPCが存在しない場合は手動チェック
        .catch(async () => {
          // 手動で重複チェック
          const { data: allRecords } = await supabaseAdmin
            .from(table.name)
            .select(`id, ${table.userColumn}`)
            .order(table.userColumn);
            
          const userCounts = {};
          allRecords?.forEach(record => {
            const userId = record[table.userColumn];
            userCounts[userId] = (userCounts[userId] || 0) + 1;
          });
          
          const duplicateUserIds = Object.keys(userCounts).filter(
            userId => userCounts[userId] > 1
          );
          
          return duplicateUserIds.map(userId => ({
            user_id: userId,
            count: userCounts[userId]
          }));
        });
        
      if (duplicates && duplicates.length > 0) {
        console.log(`   ⚠️  ${table.name} に重複データ検出:`);
        duplicates.forEach(dup => {
          console.log(`      - user_id ${dup.user_id}: ${dup.count}件`);
        });
      } else {
        console.log(`   ✅ ${table.name}: 重複データなし`);
      }
    }
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');
  
  console.log('🗄️ 孤立データクリーンアップツール\n');
  
  await cleanupOrphanedData(!executeMode);
  
  if (!executeMode) {
    console.log('\n💡 実際に削除するには --execute フラグを付けて実行してください');
  }
  
  console.log('\n✨ 完了');
}

main().catch(console.error);