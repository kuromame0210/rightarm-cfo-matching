#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProfileSave() {
  const userId = '9130389d-9ce7-4792-96f4-c97409d0084f';
  
  console.log('🧪 プロフィール保存テスト開始');
  
  // 保存前のデータを確認
  const { data: beforeData, error: beforeError } = await supabase
    .from('cfo_profiles')
    .select('*')
    .eq('cfo_user_id', userId)
    .single();
  
  console.log('📋 保存前のデータ:', beforeData);
  console.log('📋 保存前のavatar_url:', beforeData?.avatar_url);
  
  // テスト用のアバターURLを設定
  const testAvatarUrl = 'https://example.com/test-avatar.jpg';
  
  // データを更新
  const { data: updateData, error: updateError } = await supabase
    .from('cfo_profiles')
    .update({
      avatar_url: testAvatarUrl,
      cfo_name: 'テスト更新',
      updated_at: new Date().toISOString()
    })
    .eq('cfo_user_id', userId)
    .select();
  
  console.log('💾 更新結果:', updateData);
  console.log('❌ 更新エラー:', updateError);
  
  // 保存後のデータを確認
  const { data: afterData, error: afterError } = await supabase
    .from('cfo_profiles')
    .select('*')
    .eq('cfo_user_id', userId)
    .single();
  
  console.log('📋 保存後のデータ:', afterData);
  console.log('📋 保存後のavatar_url:', afterData?.avatar_url);
  
  // 結果比較
  if (beforeData?.avatar_url !== afterData?.avatar_url) {
    console.log('✅ avatar_url が正常に更新されました');
  } else {
    console.log('❌ avatar_url が更新されていません');
  }
}

testProfileSave().catch(console.error);