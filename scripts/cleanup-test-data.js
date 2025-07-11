/**
 * テストデータクリーンアップスクリプト
 * CFOテストで作成されたゴミデータを削除します
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

async function analyzeTestData() {
  console.log('🔍 テストデータの分析中...\n');
  
  try {
    // 各テーブルのデータ数を確認
    const tables = [
      'rextrix_users',
      'rextrix_user_profiles', 
      'rextrix_cfos',
      'rextrix_companies',
      'rextrix_activities',
      'rextrix_meetings',
      'rextrix_scouts',
      'rextrix_conversations',
      'rextrix_messages'
    ];
    
    console.log('📊 テーブル別データ数:');
    for (const table of tables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('id', { count: 'exact' });
        
      if (error) {
        console.log(`❌ ${table}: エラー - ${error.message}`);
      } else {
        console.log(`   ${table}: ${count || 0} 件`);
      }
    }
    
    // 最近作成されたユーザーを確認（過去24時間）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentUsers, error: usersError } = await supabaseAdmin
      .from('rextrix_users')
      .select('id, email, created_at, user_type')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('❌ 最近のユーザー取得エラー:', usersError);
    } else {
      console.log(`\n🆕 過去24時間に作成されたユーザー (${recentUsers?.length || 0}件):`);
      recentUsers?.forEach(user => {
        console.log(`   - ${user.email} (${user.user_type}) - ${new Date(user.created_at).toLocaleString('ja-JP')}`);
      });
    }
    
    // テストユーザーっぽいもの（メールアドレスにtest含む）
    const { data: testUsers, error: testUsersError } = await supabaseAdmin
      .from('rextrix_users')
      .select('id, email, created_at, user_type')
      .or('email.ilike.%test%,email.ilike.%demo%,email.ilike.%example%')
      .order('created_at', { ascending: false });
    
    if (testUsersError) {
      console.error('❌ テストユーザー取得エラー:', testUsersError);
    } else {
      console.log(`\n🧪 テスト用っぽいユーザー (${testUsers?.length || 0}件):`);
      testUsers?.slice(0, 10).forEach(user => {
        console.log(`   - ${user.email} (${user.user_type}) - ${new Date(user.created_at).toLocaleString('ja-JP')}`);
      });
      if (testUsers?.length > 10) {
        console.log(`   ... および他${testUsers.length - 10}件`);
      }
    }
    
  } catch (error) {
    console.error('❌ データ分析エラー:', error);
  }
}

async function cleanupTestData(dryRun = true) {
  console.log('\n🧹 テストデータクリーンアップ開始');
  console.log(dryRun ? '(ドライラン - 実際の削除は行いません)' : '(実際の削除を実行します)');
  
  try {
    // テスト用ユーザー（メールアドレスにtest/demo/example含む）を特定
    const { data: testUsers, error: testUsersError } = await supabaseAdmin
      .from('rextrix_users')
      .select('id, email, created_at')
      .or('email.ilike.%test%,email.ilike.%demo%,email.ilike.%example%');
    
    if (testUsersError) {
      console.error('❌ テストユーザー特定エラー:', testUsersError);
      return;
    }
    
    if (!testUsers || testUsers.length === 0) {
      console.log('✅ 削除対象のテストユーザーが見つかりませんでした');
      return;
    }
    
    console.log(`\n📋 削除対象ユーザー: ${testUsers.length}件`);
    testUsers.forEach(user => {
      console.log(`   - ${user.email} (${new Date(user.created_at).toLocaleString('ja-JP')})`);
    });
    
    if (dryRun) {
      console.log('\n💡 実際に削除するには --execute フラグを付けて実行してください');
      return;
    }
    
    // 実際の削除実行
    const userIds = testUsers.map(u => u.id);
    
    // 関連データを削除（外部キー制約により自動削除されるものもある）
    const relatedTables = [
      'rextrix_messages',
      'rextrix_conversations', 
      'rextrix_scouts',
      'rextrix_meetings',
      'rextrix_activities',
      'rextrix_user_profiles',
      'rextrix_cfos',
      'rextrix_companies'
    ];
    
    for (const table of relatedTables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .in('user_id', userIds);
        
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.log(`⚠️  ${table} 削除時の警告: ${error.message}`);
      } else {
        console.log(`✅ ${table} から関連データを削除`);
      }
    }
    
    // メインのユーザーテーブルから削除
    const { error: userDeleteError } = await supabaseAdmin
      .from('rextrix_users')
      .delete()
      .in('id', userIds);
    
    if (userDeleteError) {
      console.error('❌ ユーザー削除エラー:', userDeleteError);
    } else {
      console.log(`✅ ${testUsers.length}件のテストユーザーを削除完了`);
    }
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');
  
  console.log('🗄️ テストデータベースクリーンアップツール\n');
  
  await analyzeTestData();
  await cleanupTestData(!executeMode);
  
  console.log('\n✨ 完了');
}

main().catch(console.error);