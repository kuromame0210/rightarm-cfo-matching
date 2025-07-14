// テーブル構造確認スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTableStructure() {
  try {
    // 1. rextrix_cfos テーブルの構造確認
    console.log('\n=== REXTRIX_CFOS TABLE STRUCTURE ===');
    const { data: cfosStructure, error: cfosError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable, 
          column_default,
          ordinal_position
        FROM information_schema.columns 
        WHERE table_name = 'rextrix_cfos' 
          AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (cfosError) {
      console.error('Error fetching rextrix_cfos structure:', cfosError);
    } else {
      console.table(cfosStructure);
    }

    // 2. rextrix_user_profiles テーブルの構造確認
    console.log('\n=== REXTRIX_USER_PROFILES TABLE STRUCTURE ===');
    const { data: profilesStructure, error: profilesError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable, 
          column_default,
          ordinal_position
        FROM information_schema.columns 
        WHERE table_name = 'rextrix_user_profiles' 
          AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (profilesError) {
      console.error('Error fetching rextrix_user_profiles structure:', profilesError);
    } else {
      console.table(profilesStructure);
    }

    // 3. 既存のCFOデータサンプル確認
    console.log('\n=== EXISTING CFO DATA SAMPLE ===');
    const { data: cfoData, error: cfoDataError } = await supabase
      .from('rextrix_cfos')
      .select(`
        id,
        user_id,
        experience_years,
        experience_summary,
        achievements,
        certifications,
        is_available,
        created_at,
        rextrix_user_profiles(display_name, introduction)
      `)
      .limit(3);

    if (cfoDataError) {
      console.error('Error fetching CFO data:', cfoDataError);
    } else {
      console.log('CFO Data:');
      cfoData.forEach((cfo, index) => {
        console.log(`\n--- CFO ${index + 1} ---`);
        console.log('ID:', cfo.id);
        console.log('Display Name:', cfo.rextrix_user_profiles?.display_name);
        console.log('Experience Years:', cfo.experience_years);
        console.log('Experience Summary:', cfo.experience_summary?.substring(0, 100) + '...');
        console.log('Achievements:', JSON.stringify(cfo.achievements, null, 2));
        console.log('Certifications:', JSON.stringify(cfo.certifications, null, 2));
        console.log('Available:', cfo.is_available);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTableStructure();