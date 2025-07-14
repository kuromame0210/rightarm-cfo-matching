// introductionフィールドの詳細確認スクリプト
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

async function checkIntroductionFormat() {
  try {
    // 1. rextrix_user_profilesのintroductionフィールドを確認
    console.log('\n=== USER PROFILES INTRODUCTION FIELD ANALYSIS ===');
    const { data: profilesData, error: profilesError } = await supabase
      .from('rextrix_user_profiles')
      .select('id, user_id, display_name, introduction')
      .limit(5);

    if (profilesError) {
      console.error('Error fetching user profiles data:', profilesError);
    } else {
      profilesData.forEach((profile, index) => {
        console.log(`\n--- Profile ${index + 1} ---`);
        console.log('Display Name:', profile.display_name);
        console.log('Introduction:');
        console.log('  Type:', typeof profile.introduction);
        console.log('  Length:', profile.introduction?.length || 0);
        console.log('  Value (first 100 chars):', profile.introduction?.substring(0, 100) + '...');
      });
    }

    // 2. rextrix_cfosのintroductionフィールドを確認（こちらは別のフィールド）
    console.log('\n=== CFO PROFILES INTRODUCTION FIELD ANALYSIS ===');
    const { data: cfosData, error: cfosError } = await supabase
      .from('rextrix_cfos')
      .select('id, user_id, introduction, experience_summary')
      .limit(5);

    if (cfosError) {
      console.error('Error fetching CFO data:', cfosError);
    } else {
      cfosData.forEach((cfo, index) => {
        console.log(`\n--- CFO ${index + 1} ---`);
        console.log('CFO Introduction:');
        console.log('  Type:', typeof cfo.introduction);
        console.log('  Value:', cfo.introduction);
        console.log('Experience Summary:');
        console.log('  Type:', typeof cfo.experience_summary);
        console.log('  Length:', cfo.experience_summary?.length || 0);
        console.log('  Value (first 100 chars):', cfo.experience_summary?.substring(0, 100) + '...');
      });
    }

    // 3. introductionフィールドのテスト更新
    console.log('\n=== TESTING INTRODUCTION UPDATE ===');
    
    const testUserId = profilesData[0]?.user_id;
    const originalIntroduction = profilesData[0]?.introduction;
    
    if (testUserId) {
      console.log('Testing with user_id:', testUserId);
      console.log('Original introduction length:', originalIntroduction?.length || 0);
      
      // テスト用の長いテキスト
      const testIntroduction = "これはテスト用の自己紹介文です。CFOとして10年以上の経験があり、M&A、資金調達、IPO準備など幅広い業務に対応可能です。特に海外展開やクロスボーダーM&Aに強みを持っており、グローバルな視点での経営支援を得意としています。";
      
      // テスト1: 新しいintroductionを設定
      console.log('\nTest 1: Setting test introduction');
      const test1 = await supabase
        .from('rextrix_user_profiles')
        .update({ introduction: testIntroduction })
        .eq('user_id', testUserId)
        .select('introduction');
      
      console.log('Set test introduction result:', test1.error || 'Success');
      if (test1.data) {
        console.log('New introduction length:', test1.data[0]?.introduction?.length || 0);
      }
      
      // テスト2: 元に戻す
      console.log('\nTest 2: Restoring original introduction');
      const test2 = await supabase
        .from('rextrix_user_profiles')
        .update({ introduction: originalIntroduction })
        .eq('user_id', testUserId)
        .select('introduction');
      
      console.log('Restore result:', test2.error || 'Success');
      if (test2.data) {
        console.log('Restored introduction length:', test2.data[0]?.introduction?.length || 0);
      }
    } else {
      console.log('No test user_id available');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkIntroductionFormat();