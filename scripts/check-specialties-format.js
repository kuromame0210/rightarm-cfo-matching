// specialtiesフィールドの詳細確認スクリプト
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

async function checkSpecialtiesFormat() {
  try {
    // 1. 既存のspecialtiesデータを詳しく確認
    console.log('\n=== SPECIALTIES FIELD DATA ANALYSIS ===');
    const { data: cfosData, error: cfosError } = await supabase
      .from('rextrix_cfos')
      .select('id, user_id, specialties, achievements, certifications')
      .limit(5);

    if (cfosError) {
      console.error('Error fetching CFO data:', cfosError);
    } else {
      cfosData.forEach((cfo, index) => {
        console.log(`\n--- CFO ${index + 1} ---`);
        console.log('ID:', cfo.id);
        console.log('Specialties:');
        console.log('  Type:', typeof cfo.specialties);
        console.log('  Value:', cfo.specialties);
        console.log('  Is Array:', Array.isArray(cfo.specialties));
        console.log('  JSON.stringify:', JSON.stringify(cfo.specialties));
        
        console.log('Achievements:');
        console.log('  Type:', typeof cfo.achievements);
        console.log('  Value:', cfo.achievements);
        console.log('  Is Array:', Array.isArray(cfo.achievements));
        console.log('  JSON.stringify:', JSON.stringify(cfo.achievements));
        
        console.log('Certifications:');
        console.log('  Type:', typeof cfo.certifications);
        console.log('  Value:', cfo.certifications);
        console.log('  Is Array:', Array.isArray(cfo.certifications));
        console.log('  JSON.stringify:', JSON.stringify(cfo.certifications));
      });
    }

    // 2. 新しいデータを挿入してテスト
    console.log('\n=== TESTING SPECIALTIES INSERT FORMATS ===');
    
    // テスト用のダミーuser_id（実際にはrextrix_usersテーブルに存在する必要がある）
    const testUserId = cfosData[0]?.user_id;
    
    if (testUserId) {
      console.log('Testing with user_id:', testUserId);
      
      // テスト1: 空の配列
      console.log('\nTest 1: Empty array');
      const test1 = await supabase
        .from('rextrix_cfos')
        .update({ specialties: [] })
        .eq('user_id', testUserId)
        .select('specialties');
      
      console.log('Empty array result:', test1);
      
      // テスト2: 文字列配列
      console.log('\nTest 2: String array');
      const test2 = await supabase
        .from('rextrix_cfos')
        .update({ specialties: ['M&A', '資金調達', 'IPO準備'] })
        .eq('user_id', testUserId)
        .select('specialties');
      
      console.log('String array result:', test2);
      
      // テスト3: 元に戻す
      console.log('\nTest 3: Restore original');
      const test3 = await supabase
        .from('rextrix_cfos')
        .update({ specialties: [] })
        .eq('user_id', testUserId)
        .select('specialties');
      
      console.log('Restore result:', test3);
    } else {
      console.log('No test user_id available');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSpecialtiesFormat();