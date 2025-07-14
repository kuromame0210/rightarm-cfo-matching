// PostgreSQL情報スキーマ直接取得スクリプト
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getSchemaInfo() {
  const headers = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    // 1. rextrix_cfos テーブルの詳細構造を取得
    console.log('\n=== REXTRIX_CFOS TABLE COLUMN DETAILS ===');
    const cfosSchemaResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/sql`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
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
        })
      }
    );

    if (cfosSchemaResponse.ok) {
      const cfosSchema = await cfosSchemaResponse.json();
      console.table(cfosSchema);
    } else {
      console.error('Failed to get rextrix_cfos schema:', await cfosSchemaResponse.text());
    }

    // 2. rextrix_user_profiles テーブルの詳細構造を取得
    console.log('\n=== REXTRIX_USER_PROFILES TABLE COLUMN DETAILS ===');
    const profilesSchemaResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/sql`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
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
        })
      }
    );

    if (profilesSchemaResponse.ok) {
      const profilesSchema = await profilesSchemaResponse.json();
      console.table(profilesSchema);
    } else {
      console.error('Failed to get rextrix_user_profiles schema:', await profilesSchemaResponse.text());
    }

    // 3. specialtiesフィールドの詳細データ型を確認
    console.log('\n=== SPECIALTIES FIELD DETAILED INFO ===');
    const specialtiesInfoResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/sql`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            SELECT 
              column_name,
              data_type,
              udt_name,
              character_maximum_length,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = 'rextrix_cfos' 
              AND table_schema = 'public'
              AND column_name = 'specialties';
          `
        })
      }
    );

    if (specialtiesInfoResponse.ok) {
      const specialtiesInfo = await specialtiesInfoResponse.json();
      console.log('Specialties field details:');
      console.table(specialtiesInfo);
    } else {
      console.error('Failed to get specialties info:', await specialtiesInfoResponse.text());
    }

    // 4. experience_summaryフィールドの詳細データ型を確認
    console.log('\n=== EXPERIENCE_SUMMARY FIELD DETAILED INFO ===');
    const experienceInfoResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/sql`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            SELECT 
              column_name,
              data_type,
              udt_name,
              character_maximum_length,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = 'rextrix_cfos' 
              AND table_schema = 'public'
              AND column_name = 'experience_summary';
          `
        })
      }
    );

    if (experienceInfoResponse.ok) {
      const experienceInfo = await experienceInfoResponse.json();
      console.log('Experience summary field details:');
      console.table(experienceInfo);
    } else {
      console.error('Failed to get experience_summary info:', await experienceInfoResponse.text());
    }

    // 5. 既存のspecialtiesデータの構造確認
    console.log('\n=== EXISTING SPECIALTIES DATA STRUCTURE ===');
    const specialtiesDataResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/sql`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            SELECT 
              id,
              specialties,
              pg_typeof(specialties) as specialties_type
            FROM rextrix_cfos 
            WHERE specialties IS NOT NULL 
            LIMIT 5;
          `
        })
      }
    );

    if (specialtiesDataResponse.ok) {
      const specialtiesData = await specialtiesDataResponse.json();
      console.log('Existing specialties data:');
      console.table(specialtiesData);
    } else {
      console.error('Failed to get specialties data:', await specialtiesDataResponse.text());
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

getSchemaInfo();