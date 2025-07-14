// 5テーブル最適化設計 スキーマ作成スクリプト
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createOptimizedSchema() {
  try {
    console.log('\n=== 5テーブル最適化設計 スキーマ作成開始 ===');
    
    // SQLファイルを読み込み
    const sqlContent = await fs.readFile('scripts/create-optimized-schema.sql', 'utf-8');
    
    // SQLを分割して実行（CREATE TABLE文とINDEX文を分けて実行）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 ${statements.length}個のSQL文を実行します`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // コメント行やログ行をスキップ
      if (statement.includes('コメント') || 
          statement.includes('完了ログ') || 
          statement.includes('次のステップ') ||
          statement.startsWith('INSERT INTO rextrix_users')) {
        continue;
      }
      
      try {
        console.log(`\n${i + 1}. 実行中...`);
        
        // テーブル作成文の場合は詳細ログ
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE (\w+)/)?.[1];
          console.log(`   📊 テーブル作成: ${tableName}`);
        } else if (statement.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX (\w+)/)?.[1];
          console.log(`   🔍 インデックス作成: ${indexName}`);
        }
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement 
        });
        
        if (error) {
          console.error(`❌ エラー:`, error.message);
          errorCount++;
          
          // 致命的でないエラー（既存インデックス等）は続行
          if (!error.message.includes('already exists') && 
              !error.message.includes('relation') && 
              !error.message.includes('does not exist')) {
            console.error('💥 致命的エラーのため停止');
            break;
          }
        } else {
          console.log(`   ✅ 完了`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ 予期しないエラー:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 実行結果サマリー:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 作成されたテーブルの確認
    console.log('\n🔍 作成されたテーブルの確認:');
    
    const newTables = [
      'rextrix_cfo_profiles_new',
      'rextrix_company_profiles_new', 
      'rextrix_projects_new',
      'rextrix_interactions_new'
    ];
    
    for (const tableName of newTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${tableName}: 作成失敗 - ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: 作成成功`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: 確認エラー - ${error.message}`);
      }
    }
    
    if (successCount > 0) {
      console.log('\n🎉 最適化スキーマ作成完了！');
      console.log('📋 次のステップ: データ移行スクリプト実行');
      console.log('   node scripts/migrate-to-optimized-schema.js');
    } else {
      console.log('\n❌ スキーマ作成に失敗しました');
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

// カスタムSQL実行用のRPC関数作成（存在しない場合）
async function createExecSqlFunction() {
  try {
    console.log('🔧 SQL実行用RPC関数を作成中...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql_statement;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Supabase SQL Editorで実行する必要があるため、メッセージを表示
    console.log('⚠️  以下のSQL文をSupabase SQL Editorで実行してください:');
    console.log('=====================================');
    console.log(createFunctionSQL);
    console.log('=====================================');
    console.log('実行後、再度このスクリプトを実行してください。\n');
    
  } catch (error) {
    console.error('RPC関数作成エラー:', error);
  }
}

// 代替方法: 個別SQL実行
async function executeSchemaDirectly() {
  console.log('\n=== 代替方法: 個別テーブル作成 ===');
  
  try {
    // 1. rextrix_cfo_profiles_new 作成
    console.log('1. rextrix_cfo_profiles_new 作成中...');
    
    const { error: cfoError } = await supabase.rpc('create_cfo_profiles_table');
    
    if (cfoError && cfoError.message.includes('function') && cfoError.message.includes('does not exist')) {
      console.log('⚠️  RPC関数が存在しません。手動実行が必要です。');
      console.log('📋 以下の手順で進めてください:');
      console.log('');
      console.log('1. Supabase Dashboard → SQL Editor を開く');
      console.log('2. scripts/create-optimized-schema.sql の内容をコピー');
      console.log('3. SQL Editorで実行');
      console.log('4. 完了後、データ移行スクリプトを実行');
      console.log('   node scripts/migrate-to-optimized-schema.js');
      console.log('');
      return;
    }
    
    console.log('✅ スキーマ作成開始');
    
  } catch (error) {
    console.error('直接実行エラー:', error);
    console.log('\n📋 手動実行推奨:');
    console.log('1. Supabase Dashboard で scripts/create-optimized-schema.sql を実行');
    console.log('2. 完了後、データ移行スクリプトを実行');
  }
}

// メイン実行
async function main() {
  console.log('5テーブル最適化設計のスキーマを作成します...');
  
  // まず代替方法を試行
  await executeSchemaDirectly();
}

main();