// データベーステーブルクリーンアップスクリプト
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

async function cleanupDatabaseTables() {
  try {
    console.log('\n=== データベーステーブルクリーンアップ開始 ===');

    // 1. 現在の全テーブル一覧を取得
    console.log('\n1. 現在のテーブル一覧確認');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list', {});

    if (tablesError) {
      // RPCが存在しない場合は代替方法
      console.log('カスタムRPC関数が存在しません。既知のテーブルを基に処理します。');
    }

    // 2. 保持するテーブル（5テーブル設計）
    const KEEP_TABLES = [
      'rextrix_users',           // 認証・基本情報
      'rextrix_cfo_profiles',    // CFO統合プロフィール  
      'rextrix_company_profiles', // 企業統合プロフィール
      'rextrix_projects',        // プロジェクト・マッチング統合
      'rextrix_interactions'     // コミュニケーション統合
    ];

    // 3. 削除対象テーブル（既知のrextrixテーブル）
    const DELETE_TABLES = [
      // 統合対象テーブル
      'rextrix_cfos',             // → rextrix_cfo_profiles に統合
      'rextrix_user_profiles',    // → rextrix_cfo_profiles に統合
      'rextrix_companies',        // → rextrix_company_profiles に統合
      'rextrix_matches',          // → rextrix_projects に統合
      'rextrix_contracts',        // → rextrix_projects に統合
      'rextrix_messages',         // → rextrix_interactions に統合
      'rextrix_reviews',          // → rextrix_interactions に統合
      'rextrix_notifications',    // → rextrix_interactions に統合
      
      // 未実装・不要テーブル
      'rextrix_tags',
      'rextrix_user_tags',
      'rextrix_cfo_services',
      'rextrix_cfo_certifications',
      'rextrix_cfo_work_history',
      'rextrix_cfo_skills',
      'rextrix_cfo_availability',
      'rextrix_cfo_service_areas',
      'rextrix_cfo_compensation',
      'rextrix_company_requirements',
      'rextrix_search_filters',
      'rextrix_analytics'
    ];

    console.log('\n2. 保持するテーブル:');
    KEEP_TABLES.forEach(table => console.log(`  ✅ ${table}`));

    console.log('\n3. 削除対象テーブル:');
    DELETE_TABLES.forEach(table => console.log(`  ❌ ${table}`));

    // 4. 各テーブルの存在確認と削除実行
    console.log('\n4. テーブル削除実行:');
    
    for (const tableName of DELETE_TABLES) {
      try {
        // テーブル存在確認
        const { data: exists, error: checkError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (checkError && checkError.code === '42P01') {
          console.log(`  ⚪ ${tableName}: テーブルが存在しません（スキップ）`);
          continue;
        }

        if (checkError) {
          console.log(`  ❓ ${tableName}: 確認エラー - ${checkError.message}`);
          continue;
        }

        // データ件数確認
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        console.log(`  📊 ${tableName}: ${count || 0}件のデータ`);

        // データが存在する場合はバックアップ提案
        if (count > 0) {
          console.log(`  ⚠️  ${tableName}: データが存在します。手動確認推奨`);
          
          // 重要データの場合は詳細表示
          if (['rextrix_cfos', 'rextrix_user_profiles', 'rextrix_companies'].includes(tableName)) {
            const { data: sampleData } = await supabase
              .from(tableName)
              .select('*')
              .limit(3);
            
            console.log(`       サンプルデータ:`, sampleData?.length || 0, '件');
          }
        }

        console.log(`  🗑️  ${tableName}: 削除予定（実際の削除は手動実行推奨）`);

      } catch (error) {
        console.log(`  ❌ ${tableName}: 処理エラー - ${error.message}`);
      }
    }

    // 5. 新テーブル作成確認
    console.log('\n5. 新テーブル作成状況確認:');
    
    for (const tableName of KEEP_TABLES) {
      try {
        const { data: exists, error: checkError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (checkError && checkError.code === '42P01') {
          console.log(`  ❌ ${tableName}: 未作成（新規作成が必要）`);
        } else if (checkError) {
          console.log(`  ❓ ${tableName}: 確認エラー - ${checkError.message}`);
        } else {
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          console.log(`  ✅ ${tableName}: 存在（${count || 0}件）`);
        }
      } catch (error) {
        console.log(`  ❌ ${tableName}: チェックエラー - ${error.message}`);
      }
    }

    // 6. クリーンアップ推奨手順
    console.log('\n6. 推奨クリーンアップ手順:');
    console.log('');
    console.log('=== 段階的実行推奨 ===');
    console.log('');
    console.log('Step 1: 重要データのバックアップ');
    console.log('  - 実データが存在するテーブルのバックアップ作成');
    console.log('  - 特に rextrix_cfos, rextrix_user_profiles, rextrix_companies');
    console.log('');
    console.log('Step 2: 新テーブル作成');
    console.log('  - 5テーブル設計の新テーブル作成');
    console.log('  - スキーマ・インデックス・制約の設定');
    console.log('');
    console.log('Step 3: データ移行');
    console.log('  - 既存データを新テーブルに移行');
    console.log('  - データ整合性チェック');
    console.log('');
    console.log('Step 4: API更新・テスト');
    console.log('  - API エンドポイントの更新');
    console.log('  - 機能テスト・動作確認');
    console.log('');
    console.log('Step 5: 旧テーブル削除');
    console.log('  - 動作確認後に旧テーブルを削除');
    console.log('  - 完全なクリーンアップ');

    console.log('\n✅ クリーンアップ計画完了');

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

cleanupDatabaseTables();