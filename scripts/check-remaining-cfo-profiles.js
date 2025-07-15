#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkRemainingCFOProfiles() {
  try {
    // CFOプロフィールを取得
    const { data: profiles, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error:', error);
      return;
    }

    // auth.usersテーブルから対応するメールアドレスを取得
    const userIds = profiles.map(p => p.cfo_user_id);
    const { data: users, error: userError } = await supabase
      .auth.admin.listUsers();

    if (userError) {
      console.error('User Error:', userError);
      return;
    }

    // メールアドレスのマッピングを作成
    const emailMap = {};
    if (users && users.users) {
      users.users.forEach(user => {
        emailMap[user.id] = user.email;
      });
    }

    console.log('=== 全CFOプロフィール調査 ===');
    console.log('総件数:', profiles.length);
    console.log('');

    // メインの6名の判定
    const mainSixNames = ['佐藤大悟', '奥田豊', '佐藤智彦', '菅原大源', '副島', '田中'];
    const mainSixProfiles = [];
    const otherProfiles = [];

    profiles.forEach((profile, index) => {
      const isMainSix = mainSixNames.some(name => 
        profile.cfo_name && profile.cfo_name.includes(name)
      );
      
      // メールアドレスを追加
      profile.email = emailMap[profile.cfo_user_id] || 'なし';
      
      if (isMainSix) {
        mainSixProfiles.push(profile);
      } else {
        otherProfiles.push(profile);
      }
    });

    console.log('🎯 メインの6名プロフィール数:', mainSixProfiles.length);
    console.log('❓ その他のプロフィール数:', otherProfiles.length);
    console.log('');

    console.log('=== その他のプロフィール詳細 ===');
    otherProfiles.forEach((profile, index) => {
      console.log(`--- その他 ${index + 1} ---`);
      console.log('ID:', profile.cfo_user_id);
      console.log('メールアドレス:', profile.email);
      console.log('名前:', profile.cfo_name);
      console.log('表示名:', profile.cfo_display_name);
      console.log('場所:', profile.cfo_location);
      console.log('スキル数:', Array.isArray(profile.cfo_skills) ? profile.cfo_skills.length : 0);
      console.log('スキル:', profile.cfo_skills);
      console.log('報酬:', profile.cfo_compensation);
      console.log('稼働条件:', profile.cfo_availability);
      console.log('紹介文:', profile.cfo_introduction);
      console.log('経歴:', profile.cfo_raw_profile ? profile.cfo_raw_profile.substring(0, 100) + '...' : 'なし');
      console.log('作成日:', profile.created_at);
      console.log('更新日:', profile.updated_at);
      console.log('');
    });

    console.log('=== 全プロフィール一覧（メールアドレス付き） ===');
    profiles.forEach((profile, index) => {
      const isMainSix = mainSixNames.some(name => 
        profile.cfo_name && profile.cfo_name.includes(name)
      );
      
      console.log(`${index + 1}. ${profile.cfo_name || '名前なし'} (${profile.email}) ${isMainSix ? '✅' : '❌'}`);
      console.log(`   ID: ${profile.cfo_user_id}`);
      console.log(`   作成日: ${profile.created_at}`);
      console.log('');
    });

    console.log('=== メインの6名の重複確認 ===');
    const nameCount = {};
    mainSixProfiles.forEach(profile => {
      const name = profile.cfo_name;
      nameCount[name] = (nameCount[name] || 0) + 1;
    });

    Object.entries(nameCount).forEach(([name, count]) => {
      if (count > 1) {
        console.log(`⚠️  ${name}: ${count}件の重複`);
      } else {
        console.log(`✅ ${name}: 1件`);
      }
    });

  } catch (error) {
    console.error('エラー:', error);
  }
}

checkRemainingCFOProfiles();