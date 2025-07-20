const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMissingProfiles() {
  console.log('🔧 プロフィールなしユーザーの修正\n');

  // 1. プロフィールがないユーザーを特定
  console.log('📊 プロフィールなしユーザーの特定:');
  
  try {
    const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('認証ユーザー取得エラー:', authError.message);
      return;
    }

    const authUsers = authUsersResponse.users || [];
    const usersWithoutProfile = [];

    for (const authUser of authUsers) {
      // CFOプロフィール確認
      const { data: cfoProfile } = await supabase
        .from('cfo_profiles')
        .select('cfo_user_id')
        .eq('cfo_user_id', authUser.id)
        .single();

      // 企業プロフィール確認
      const { data: bizProfile } = await supabase
        .from('biz_profiles')
        .select('biz_user_id')
        .eq('biz_user_id', authUser.id)
        .single();

      if (!cfoProfile && !bizProfile) {
        usersWithoutProfile.push(authUser);
      }
    }

    console.log(`プロフィールなしユーザー: ${usersWithoutProfile.length}件\n`);

    if (usersWithoutProfile.length === 0) {
      console.log('✅ プロフィールなしユーザーはいませんでした');
      return;
    }

    // 2. 各ユーザーの詳細情報とメタデータ確認
    for (const user of usersWithoutProfile) {
      console.log(`🔍 ${user.email}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   メタデータ: ${JSON.stringify(user.user_metadata)}`);
      console.log(`   作成日: ${user.created_at}`);
      
      // メタデータからroleを判定
      const metadataRole = user.user_metadata?.role;
      let suggestedUserType = 'company'; // デフォルト
      
      if (metadataRole === 'cfo') {
        suggestedUserType = 'cfo';
      } else if (metadataRole === 'company') {
        suggestedUserType = 'company';
      }
      
      console.log(`   推奨userType: ${suggestedUserType} (メタデータのrole: ${metadataRole})`);
    }

    // 3. 修正方法の提案
    console.log('\n🛠️ 修正方法の提案:');
    console.log('以下のいずれかの方法で修正できます:');
    console.log('');
    console.log('A. テストユーザーの削除（推奨）');
    console.log('   → 開発・テスト用のユーザーなので削除');
    console.log('');
    console.log('B. デフォルトプロフィールの作成');
    console.log('   → メタデータのroleに基づいてプロフィールを作成');
    console.log('');
    console.log('C. プロフィール設定画面への誘導');
    console.log('   → ログイン時にプロフィール未設定を検出して設定画面へ');

    // 4. 実際の修正実行（確認付き）
    console.log('\n🚀 テストユーザーを削除しますか？ (y/N)');
    
    // 実際の環境では入力待ちは困難なので、ログのみ出力
    console.log('⚠️  手動での確認が必要です');
    console.log('次のコマンドで個別に削除できます:');
    
    for (const user of usersWithoutProfile) {
      if (user.email.includes('crow0210kuro') || user.email.includes('test-')) {
        console.log(`   削除対象: ${user.email} (${user.id})`);
      }
    }

    // 5. NextAuth認証ロジックの修正提案
    console.log('\n💡 根本的な修正提案:');
    console.log('src/lib/auth/index.ts の修正:');
    console.log('```javascript');
    console.log('// 現在（問題）');
    console.log('let userType = "cfo" // デフォルト');
    console.log('');
    console.log('// 修正案1: デフォルトをcompanyに');
    console.log('let userType = "company" // デフォルト');
    console.log('');
    console.log('// 修正案2: プロフィール未設定時のエラー');
    console.log('if (!cfoProfile && !bizProfile) {');
    console.log('  console.log("⚠️ プロフィール未設定:", user.email)');
    console.log('  return null // 認証拒否');
    console.log('}');
    console.log('```');

  } catch (error) {
    console.error('修正処理エラー:', error);
  }
}

// 実行
fixMissingProfiles().catch(console.error);