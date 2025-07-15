#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserProfile() {
  const userId = '9130389d-9ce7-4792-96f4-c97409d0084f';
  
  console.log('🔍 ユーザープロフィール調査開始');
  console.log('ユーザーID:', userId);
  
  // CFOプロフィールを確認
  const { data: cfoProfile, error: cfoError } = await supabase
    .from('cfo_profiles')
    .select('*')
    .eq('cfo_user_id', userId);
  
  console.log('\n📊 CFO Profile Check:');
  console.log('Data:', cfoProfile);
  console.log('Error:', cfoError);
  
  // 企業プロフィールを確認
  const { data: companyProfile, error: companyError } = await supabase
    .from('biz_profiles')
    .select('*')
    .eq('biz_user_id', userId);
  
  console.log('\n🏢 Company Profile Check:');
  console.log('Data:', companyProfile);
  console.log('Error:', companyError);
  
  // ユーザーが存在するか確認
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  console.log('\n👤 Auth User Check:');
  console.log('User exists:', !!authUser.user);
  console.log('User email:', authUser.user?.email);
  console.log('Error:', authError);
  
  // テーブル構造を確認
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', 'rextrix_%');
  
  console.log('\n🗂️ Available Tables:');
  console.log('Tables:', tables?.map(t => t.table_name));
  console.log('Error:', tableError);
}

checkUserProfile().catch(console.error);