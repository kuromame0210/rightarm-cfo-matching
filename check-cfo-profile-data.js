const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ipovokidhyhojjqhanwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwb3Zva2lkaHlob2pqcWhhbndqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTE3MywiZXhwIjoyMDY4MDQ1MTczfQ.RyEKSSsLjip0TQht-Flu4fox0jIUaizsEK1ew9oH7Kk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // CFO関連のテーブル名候補
    const possibleTables = [
      'rextrix_cfos',
      'cfos',
      'cfo_profiles',
      'user_profiles',
      'rextrix_user_profiles',
      'rightarm_cfos',
      'rightarm_cfo_profiles'
    ];

    console.log('=== Checking for CFO-related tables ===');

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          console.log('✅ Found table:', tableName);
          
          if (data && data.length > 0) {
            console.log('  Sample columns:', Object.keys(data[0]));
          }
        } else {
          console.log('❌ Table not found:', tableName);
        }
      } catch (e) {
        console.log('❌ Error checking table:', tableName, e.message);
      }
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

async function investigateRawProfile() {
  try {
    // cfo_profilesテーブルで佐藤大悟さんと奥田豊さんのデータを取得
    console.log(`\n=== Checking table: cfo_profiles ===`);
    
    const { data: cfos, error } = await supabase
      .from('cfo_profiles')
      .select('*');

    if (error) {
      console.log(`Error with table cfo_profiles:`, error.message);
      return;
    }

    if (cfos && cfos.length > 0) {
      console.log(`Found ${cfos.length} records in cfo_profiles`);
      
      // 佐藤大悟さんと奥田豊さんのデータを探す
      const targetCfos = cfos.filter(cfo => 
        cfo.cfo_name && (
          cfo.cfo_name.includes('佐藤') || 
          cfo.cfo_name.includes('大悟') ||
          cfo.cfo_name.includes('奥田') ||
          cfo.cfo_name.includes('豊')
        )
      );
      
      console.log(`Found ${targetCfos.length} target CFOs`);
      
      for (const cfo of targetCfos) {
        console.log('\n' + '='.repeat(50));
        console.log('Record from table: cfo_profiles');
        console.log('Name:', cfo.cfo_name);
        console.log('Display Name:', cfo.cfo_display_name);
        console.log('User ID:', cfo.cfo_user_id);
        console.log('Location:', cfo.cfo_location);
        console.log('Availability:', cfo.cfo_availability);
        
        // raw_profile関連のフィールドを探す
        const rawProfileFields = Object.keys(cfo).filter(key => 
          key.toLowerCase().includes('raw') || 
          key.toLowerCase().includes('profile') ||
          key.toLowerCase().includes('bio') ||
          key.toLowerCase().includes('description') ||
          key.toLowerCase().includes('introduction')
        );
        
        console.log('Raw profile fields found:', rawProfileFields);
        
        for (const field of rawProfileFields) {
          if (cfo[field] && typeof cfo[field] === 'string') {
            console.log(`\n--- ${field} Content ---`);
            console.log('Length:', cfo[field].length);
            console.log('Content:');
            console.log(cfo[field]);
            
            // 個人情報が含まれているかチェック
            const personalInfoChecks = {
              'contains_name_section': cfo[field].includes('【名前】'),
              'contains_residence': cfo[field].includes('【居住地】'),
              'contains_working_hours': cfo[field].includes('【稼働時間】'),
              'contains_contact': cfo[field].includes('【連絡先】'),
              'contains_career_section': cfo[field].includes('【経歴】'),
              'contains_specialties': cfo[field].includes('【専門分野】'),
              'contains_compensation': cfo[field].includes('【報酬】')
            };
            
            console.log('\n--- Personal Info Check ---');
            for (const [check, result] of Object.entries(personalInfoChecks)) {
              console.log(check + ':', result);
            }
          }
        }
      }
    } else {
      console.log(`No records found in cfo_profiles`);
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

async function main() {
  await checkTables();
  await investigateRawProfile();
}

main();