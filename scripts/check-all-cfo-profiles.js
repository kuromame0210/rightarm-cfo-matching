// 全CFOプロフィールテーブル確認スクリプト
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

async function checkAllCfoProfiles() {
  try {
    console.log('\n=== 全CFOプロフィールテーブル確認 ===');

    // rextrix_cfo_profiles テーブル
    console.log('\n1. rextrix_cfo_profiles テーブル:');
    const { data: cfoProfiles, error: cfoProfilesError } = await supabase
      .from('rextrix_cfo_profiles')
      .select('*');

    if (cfoProfilesError) {
      console.error('rextrix_cfo_profiles エラー:', cfoProfilesError);
    } else {
      console.log(`件数: ${cfoProfiles.length}件`);
      cfoProfiles.forEach((profile, index) => {
        console.log(`\n--- Profile ${index + 1} ---`);
        console.log(`ID: ${profile.id}`);
        console.log(`CFO_ID: ${profile.cfo_id}`);
        console.log(`full_name: "${profile.full_name}"`);
        console.log(`display_name: "${profile.display_name}"`);
        console.log(`nickname: "${profile.nickname}"`);
      });
    }

    // 対象CFOのcfo_idを取得
    const targetEmails = ['tomohiko.sato@example.com', 'taigen.sugawara@example.com', 'nanalysts@example.com', 'ibkipu@example.com'];
    
    console.log('\n2. 対象CFOのcfo_id確認:');
    const { data: cfoIds, error: cfoIdsError } = await supabase
      .from('rextrix_cfos')
      .select(`
        id,
        rextrix_users!inner(email)
      `)
      .in('rextrix_users.email', targetEmails);

    if (cfoIdsError) {
      console.error('CFO ID取得エラー:', cfoIdsError);
    } else {
      cfoIds.forEach(cfo => {
        console.log(`${cfo.rextrix_users.email} → CFO_ID: ${cfo.id}`);
      });

      // rextrix_cfo_profilesに対応レコードが存在するかチェック
      console.log('\n3. rextrix_cfo_profilesの対応確認:');
      const cfoIdList = cfoIds.map(cfo => cfo.id);
      
      const { data: existingProfiles, error: existingError } = await supabase
        .from('rextrix_cfo_profiles')
        .select('*')
        .in('cfo_id', cfoIdList);

      if (existingError) {
        console.error('既存プロフィール確認エラー:', existingError);
      } else {
        console.log(`対象CFOの rextrix_cfo_profiles レコード: ${existingProfiles.length}件`);
        
        cfoIds.forEach(cfo => {
          const matchingProfile = existingProfiles.find(p => p.cfo_id === cfo.id);
          if (matchingProfile) {
            console.log(`✅ ${cfo.rextrix_users.email}: rextrix_cfo_profiles レコード存在`);
            console.log(`   full_name: "${matchingProfile.full_name}"`);
            console.log(`   display_name: "${matchingProfile.display_name}"`);
          } else {
            console.log(`❌ ${cfo.rextrix_users.email}: rextrix_cfo_profiles レコード不存在`);
          }
        });
      }
    }

    // 実際のAPI呼び出しをシミュレート
    console.log('\n4. API取得データシミュレーション:');
    try {
      const response = await fetch('http://localhost:3000/api/cfos?limit=10');
      if (response.ok) {
        const apiData = await response.json();
        console.log('API応答受信成功:');
        apiData.cfos?.slice(0, 4).forEach((cfo, index) => {
          console.log(`\n--- API CFO ${index + 1} ---`);
          console.log(`name: "${cfo.name}"`);
          console.log(`email: "${cfo.email}"`);
          console.log(`title: "${cfo.title}"`);
        });
      } else {
        console.log('APIサーバーが起動していません（正常）');
      }
    } catch (e) {
      console.log('APIテスト: 開発サーバー未起動（正常）');
    }

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

checkAllCfoProfiles();