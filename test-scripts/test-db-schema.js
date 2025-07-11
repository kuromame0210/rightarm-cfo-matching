// データベーススキーマ確認用テストスクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDatabaseSchema() {
  console.log('🔍 データベーススキーマ確認テスト...\n');
  
  try {
    // 1. 既存テーブルの確認
    console.log('1. 既存テーブルの確認...');
    const { data: tables, error: tableError } = await supabase.rpc('get_table_names');
    
    if (tableError) {
      console.log('RPCが利用できません。代替方法を使用...');
      
      // 代替方法：直接SQLクエリを試す
      const { data: directTables, error: directError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (directError) {
        console.log('直接クエリも失敗。手動確認を行います...');
        
        // 手動でテーブルを確認
        const testTables = [
          'rextrix_users',
          'rightarm_users',
          'users',
          'auth.users'
        ];
        
        for (const tableName of testTables) {
          console.log(`\n📋 テーブル ${tableName} の確認...`);
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`❌ ${tableName}: ${error.message}`);
          } else {
            console.log(`✅ ${tableName}: 存在します`);
            
            // カラム情報を確認
            if (data && data.length > 0) {
              console.log(`   カラム: ${Object.keys(data[0]).join(', ')}`);
            } else {
              console.log('   データなし（空のテーブル）');
            }
          }
        }
        
      } else {
        console.log('✅ 存在するテーブル:', directTables.map(t => t.tablename).filter(name => name.includes('user') || name.includes('rextrix') || name.includes('rightarm')));
      }
    } else {
      console.log('✅ テーブル一覧取得成功');
    }

    // 2. rextrix_usersテーブルの詳細確認
    console.log('\n2. rextrix_usersテーブルの詳細確認...');
    const { data: userTableData, error: userTableError } = await supabase
      .from('rextrix_users')
      .select('*')
      .limit(1);
    
    if (userTableError) {
      console.log('❌ rextrix_usersテーブルが存在しません:', userTableError.message);
      
      // rightarm_usersテーブルを確認
      console.log('\n   rightarm_usersテーブルの確認...');
      const { data: rightarmData, error: rightarmError } = await supabase
        .from('rightarm_users')
        .select('*')
        .limit(1);
      
      if (rightarmError) {
        console.log('❌ rightarm_usersテーブルも存在しません:', rightarmError.message);
      } else {
        console.log('✅ rightarm_usersテーブルが存在します');
        if (rightarmData && rightarmData.length > 0) {
          console.log('   カラム:', Object.keys(rightarmData[0]).join(', '));
          console.log('   user_type列の存在:', rightarmData[0].hasOwnProperty('user_type') ? '✅' : '❌');
          console.log('   userType列の存在:', rightarmData[0].hasOwnProperty('userType') ? '✅' : '❌');
        }
      }
    } else {
      console.log('✅ rextrix_usersテーブルが存在します');
      if (userTableData && userTableData.length > 0) {
        console.log('   カラム:', Object.keys(userTableData[0]).join(', '));
        console.log('   user_type列の存在:', userTableData[0].hasOwnProperty('user_type') ? '✅' : '❌');
        console.log('   userType列の存在:', userTableData[0].hasOwnProperty('userType') ? '✅' : '❌');
      }
    }

    // 3. Supabase Authテーブルの確認
    console.log('\n3. Supabase Authテーブルの確認...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth ユーザー一覧取得エラー:', authError.message);
    } else {
      console.log('✅ Auth システムは正常に動作しています');
      console.log('   登録ユーザー数:', authUsers.users.length);
      if (authUsers.users.length > 0) {
        const firstUser = authUsers.users[0];
        console.log('   サンプルユーザー metadata:', firstUser.user_metadata);
      }
    }

  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message);
  }
}

// 実行
testDatabaseSchema();