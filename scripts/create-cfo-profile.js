#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCFOProfile() {
  const userId = '9130389d-9ce7-4792-96f4-c97409d0084f';
  
  console.log('🚀 CFOプロフィール作成開始');
  console.log('ユーザーID:', userId);
  
  // 基本的なCFOプロフィールデータ
  const profileData = {
    cfo_user_id: userId,
    cfo_name: 'crow0210kuro',
    cfo_display_name: 'crow0210kuro',
    cfo_location: '',
    cfo_availability: '',
    cfo_fee_min: null,
    cfo_fee_max: null,
    cfo_skills: [],
    cfo_raw_profile: '',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('cfo_profiles')
    .insert(profileData)
    .select();
  
  if (error) {
    console.error('❌ CFOプロフィール作成エラー:', error);
  } else {
    console.log('✅ CFOプロフィール作成成功:', data);
  }
}

createCFOProfile().catch(console.error);