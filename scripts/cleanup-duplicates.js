/**
 * 重複データクリーンアップスクリプト
 * 同じuser_idで複数のプロファイルがある重複データを削除
 */

require('dotenv').config({ path: '.env.test' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupDuplicates(dryRun = true) {
  console.log('🧹 重複データクリーンアップ開始');
  console.log(dryRun ? '(ドライラン - 実際の削除は行いません)' : '(実際の削除を実行します)');
  
  try {
    // rextrix_user_profiles の重複チェック
    console.log('\\n📝 ユーザープロファイルの重複チェック...');
    
    const { data: profiles } = await supabaseAdmin
      .from('rextrix_user_profiles')
      .select('id, user_id, display_name, created_at')
      .order('user_id')
      .order('created_at', { ascending: true });
    
    const userProfileCount = {};
    const duplicateProfiles = [];
    
    profiles?.forEach(profile => {
      if (!userProfileCount[profile.user_id]) {
        userProfileCount[profile.user_id] = [];
      }
      userProfileCount[profile.user_id].push(profile);
    });
    
    // 2つ以上のプロファイルを持つユーザーを特定
    Object.keys(userProfileCount).forEach(userId => {
      const userProfiles = userProfileCount[userId];
      if (userProfiles.length > 1) {
        // 最初のプロファイル以外を削除対象とする
        const toDelete = userProfiles.slice(1);
        duplicateProfiles.push(...toDelete);
        
        console.log(`   重複発見 user_id: ${userId} - ${userProfiles.length}件`);
        userProfiles.forEach((p, i) => {
          console.log(`     ${i+1}. ${p.display_name} (${p.created_at}) ${i === 0 ? '← 保持' : '← 削除対象'}`);
        });
      }
    });
    
    if (duplicateProfiles.length > 0) {
      console.log(`\\n削除対象プロファイル: ${duplicateProfiles.length}件`);
      
      if (!dryRun) {
        const deleteIds = duplicateProfiles.map(p => p.id);
        const { error } = await supabaseAdmin
          .from('rextrix_user_profiles')
          .delete()
          .in('id', deleteIds);
          
        if (error) {
          console.error('❌ プロファイル削除エラー:', error);
        } else {
          console.log(`✅ ${duplicateProfiles.length}件の重複プロファイルを削除`);
        }
      }
    } else {
      console.log('✅ プロファイルの重複なし');
    }
    
    // rextrix_cfos の重複チェック
    console.log('\\n💼 CFOプロファイルの重複チェック...');
    
    const { data: cfos } = await supabaseAdmin
      .from('rextrix_cfos')
      .select('id, user_id, experience_years, created_at')
      .order('user_id')
      .order('created_at', { ascending: true });
    
    const userCfoCount = {};
    const duplicateCfos = [];
    
    cfos?.forEach(cfo => {
      if (!userCfoCount[cfo.user_id]) {
        userCfoCount[cfo.user_id] = [];
      }
      userCfoCount[cfo.user_id].push(cfo);
    });
    
    // 2つ以上のCFOプロファイルを持つユーザーを特定
    Object.keys(userCfoCount).forEach(userId => {
      const userCfos = userCfoCount[userId];
      if (userCfos.length > 1) {
        // 最初のCFOプロファイル以外を削除対象とする
        const toDelete = userCfos.slice(1);
        duplicateCfos.push(...toDelete);
        
        console.log(`   重複発見 user_id: ${userId} - ${userCfos.length}件`);
        userCfos.forEach((c, i) => {
          console.log(`     ${i+1}. 経験年数: ${c.experience_years}年 (${c.created_at}) ${i === 0 ? '← 保持' : '← 削除対象'}`);
        });
      }
    });
    
    if (duplicateCfos.length > 0) {
      console.log(`\\n削除対象CFOプロファイル: ${duplicateCfos.length}件`);
      
      if (!dryRun) {
        const deleteIds = duplicateCfos.map(c => c.id);
        const { error } = await supabaseAdmin
          .from('rextrix_cfos')
          .delete()
          .in('id', deleteIds);
          
        if (error) {
          console.error('❌ CFOプロファイル削除エラー:', error);
        } else {
          console.log(`✅ ${duplicateCfos.length}件の重複CFOプロファイルを削除`);
        }
      }
    } else {
      console.log('✅ CFOプロファイルの重複なし');
    }
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');
  
  console.log('🗄️ 重複データクリーンアップツール\\n');
  
  await cleanupDuplicates(!executeMode);
  
  if (!executeMode) {
    console.log('\\n💡 実際に削除するには --execute フラグを付けて実行してください');
  }
  
  console.log('\\n✨ 完了');
}

main().catch(console.error);