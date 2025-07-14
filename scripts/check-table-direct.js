// テーブル構造直接確認スクリプト
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

async function checkTables() {
  try {
    // 1. テーブル一覧確認
    console.log('\n=== CHECKING EXISTING TABLES ===');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .like('table_name', '%rextrix%');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    } else {
      console.table(tables);
    }

    // 2. rextrix_cfos テーブルが存在するか確認
    console.log('\n=== CHECKING REXTRIX_CFOS TABLE ===');
    const { data: cfosTable, error: cfosTableError } = await supabase
      .from('rextrix_cfos')
      .select('*')
      .limit(1);

    if (cfosTableError) {
      console.error('rextrix_cfos table error:', cfosTableError);
    } else {
      console.log('rextrix_cfos table exists, sample data keys:', Object.keys(cfosTable[0] || {}));
    }

    // 3. rextrix_user_profiles テーブルが存在するか確認
    console.log('\n=== CHECKING REXTRIX_USER_PROFILES TABLE ===');
    const { data: profilesTable, error: profilesTableError } = await supabase
      .from('rextrix_user_profiles')
      .select('*')
      .limit(1);

    if (profilesTableError) {
      console.error('rextrix_user_profiles table error:', profilesTableError);
    } else {
      console.log('rextrix_user_profiles table exists, sample data keys:', Object.keys(profilesTable[0] || {}));
    }

    // 4. 実際のCFOデータを確認
    console.log('\n=== CHECKING ACTUAL CFO DATA ===');
    const { data: cfosData, error: cfosDataError } = await supabase
      .from('rextrix_cfos')
      .select('*')
      .limit(3);

    if (cfosDataError) {
      console.error('Error fetching CFO data:', cfosDataError);
    } else {
      console.log(`Found ${cfosData.length} CFO records`);
      cfosData.forEach((cfo, index) => {
        console.log(`\n--- CFO ${index + 1} ---`);
        console.log('All fields:', Object.keys(cfo));
        console.log('Sample data:');
        Object.entries(cfo).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 100) {
            console.log(`${key}: ${value.substring(0, 100)}...`);
          } else {
            console.log(`${key}:`, value);
          }
        });
      });
    }

    // 5. ユーザープロフィールデータを確認
    console.log('\n=== CHECKING USER PROFILES DATA ===');
    const { data: profilesData, error: profilesDataError } = await supabase
      .from('rextrix_user_profiles')
      .select('*')
      .limit(3);

    if (profilesDataError) {
      console.error('Error fetching user profiles data:', profilesDataError);
    } else {
      console.log(`Found ${profilesData.length} user profile records`);
      profilesData.forEach((profile, index) => {
        console.log(`\n--- Profile ${index + 1} ---`);
        console.log('All fields:', Object.keys(profile));
        console.log('Sample data:');
        Object.entries(profile).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 100) {
            console.log(`${key}: ${value.substring(0, 100)}...`);
          } else {
            console.log(`${key}:`, value);
          }
        });
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables();