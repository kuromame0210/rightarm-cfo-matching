const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAuthUserType() {
  console.log('🔍 NextAuth userType判定ロジックのデバッグ\n');

  // 1. 全ユーザーの認証情報とプロフィール情報をマッピング
  console.log('📊 ユーザー認証情報とプロフィールのマッピング:');
  
  try {
    // 認証ユーザー一覧を取得
    const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('認証ユーザー取得エラー:', authError.message);
      return;
    }

    const authUsers = authUsersResponse.users || [];
    console.log(`認証ユーザー総数: ${authUsers.length}件\n`);

    for (const authUser of authUsers.slice(0, 10)) { // 最初の10名をチェック
      console.log(`🔐 ${authUser.email} (${authUser.id}):`);
      console.log(`   メタデータ: ${JSON.stringify(authUser.user_metadata)}`);

      // CFOプロフィール確認
      const { data: cfoProfile, error: cfoError } = await supabase
        .from('cfo_profiles')
        .select('cfo_name, cfo_display_name')
        .eq('cfo_user_id', authUser.id)
        .single();

      let userType = 'cfo'; // デフォルト（NextAuth設定と同じ）
      let profileFound = false;

      if (cfoError) {
        // console.log(`     CFOプロフィール: なし (${cfoError.message})`);
        console.log(`     CFOプロフィール: なし`);
      } else {
        console.log(`     CFOプロフィール: あり - ${cfoProfile.cfo_display_name || cfoProfile.cfo_name}`);
        userType = 'cfo';
        profileFound = true;
      }

      if (!profileFound) {
        // 企業プロフィール確認
        const { data: bizProfile, error: bizError } = await supabase
          .from('biz_profiles')
          .select('biz_company_name')
          .eq('biz_user_id', authUser.id)
          .single();

        if (bizError) {
          console.log(`     企業プロフィール: なし`);
        } else {
          console.log(`     企業プロフィール: あり - ${bizProfile.biz_company_name}`);
          userType = 'company';
          profileFound = true;
        }
      }

      console.log(`   → NextAuth判定結果: userType="${userType}"`);
      console.log(`   → プロフィール存在: ${profileFound ? 'あり' : 'なし'}`);
      
      // 問題のあるケースを特定
      if (!profileFound) {
        console.log(`   ⚠️  問題: プロフィールがないのにuserType="${userType}"になる`);
      }
      
      // メタデータのrole確認
      if (authUser.user_metadata?.role) {
        console.log(`   📝 メタデータのrole: "${authUser.user_metadata.role}"`);
        if (authUser.user_metadata.role !== userType) {
          console.log(`   ⚠️  不一致: メタデータ="${authUser.user_metadata.role}" vs 判定="${userType}"`);
        }
      }
      
      console.log('');
    }

    // 2. 問題のケースを特定
    console.log('🚨 問題のあるケースの特定:');
    
    let problematicUsers = 0;
    
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

      const hasCfoProfile = !!cfoProfile;
      const hasBizProfile = !!bizProfile;
      
      // NextAuthのロジックと同じ判定
      let expectedUserType = 'cfo'; // デフォルト
      if (hasCfoProfile) {
        expectedUserType = 'cfo';
      } else if (hasBizProfile) {
        expectedUserType = 'company';
      }

      // 問題のケース
      if (!hasCfoProfile && !hasBizProfile) {
        console.log(`⚠️  ${authUser.email}: プロフィールなし → userType="${expectedUserType}" (デフォルト)`);
        problematicUsers++;
      } else if (hasCfoProfile && expectedUserType !== 'cfo') {
        console.log(`⚠️  ${authUser.email}: CFOプロフィールあり → userType="${expectedUserType}" (異常)`);
        problematicUsers++;
      } else if (hasBizProfile && expectedUserType !== 'company') {
        console.log(`⚠️  ${authUser.email}: 企業プロフィールあり → userType="${expectedUserType}" (異常)`);
        problematicUsers++;
      }
    }
    
    if (problematicUsers === 0) {
      console.log('✅ 問題のあるケースは見つかりませんでした');
    } else {
      console.log(`⚠️  問題のあるユーザー: ${problematicUsers}件`);
    }

  } catch (error) {
    console.error('デバッグエラー:', error);
  }
}

// 実行
debugAuthUserType().catch(console.error);