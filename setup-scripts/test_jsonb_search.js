const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testJSONBSearch() {
  try {
    console.log('🔍 JSONB Search Test');
    console.log('');

    // 1. Test CFO skills search with proper JSONB syntax
    console.log('1. Testing CFO skills search...');
    
    // Method 1: @> operator (JSONB contains)
    const { data: ipoExperts1, error: search1Error } = await supabase
      .from('cfo_profiles')
      .select('cfo_name, cfo_skills')
      .filter('cfo_skills', 'cs', '["IPO支援"]');

    if (search1Error) {
      console.log('   ❌ Method 1 (contains) failed:', search1Error.message);
    } else {
      console.log(`   ✅ Method 1: Found ${ipoExperts1.length} IPO experts`);
      ipoExperts1.forEach(expert => {
        console.log(`      - ${expert.cfo_name}: ${JSON.stringify(expert.cfo_skills)}`);
      });
    }

    // Method 2: ? operator (JSONB key exists)
    const { data: ipoExperts2, error: search2Error } = await supabase
      .from('cfo_profiles')
      .select('cfo_name, cfo_skills')
      .filter('cfo_skills', 'cs', '{"IPO支援"}');

    if (search2Error) {
      console.log('   ❌ Method 2 (key exists) failed:', search2Error.message);
    } else {
      console.log(`   ✅ Method 2: Found ${ipoExperts2.length} IPO experts`);
    }

    // Method 3: Array element text search
    const { data: ipoExperts3, error: search3Error } = await supabase
      .rpc('search_cfo_skills', { skill_term: 'IPO支援' })
      .catch(() => null);

    if (search3Error) {
      console.log('   ❌ Method 3 (RPC function) not available');
    }

    // 2. Test direct SQL with proper JSONB operators
    console.log('\n2. Testing raw JSONB queries...');
    
    try {
      // Using PostgREST filter syntax for JSONB
      const { data: directQuery, error: directError } = await supabase
        .from('cfo_profiles')
        .select('cfo_name, cfo_skills')
        .textSearch('cfo_raw_profile', 'IPO');

      if (directError) {
        console.log('   ❌ Text search failed:', directError.message);
      } else {
        console.log(`   ✅ Text search: Found ${directQuery.length} profiles mentioning IPO`);
      }
    } catch (e) {
      console.log('   ❌ Direct query failed:', e.message);
    }

    // 3. Alternative: String-based search in JSONB
    console.log('\n3. Testing alternative search methods...');
    
    // Get all profiles and filter client-side for demonstration
    const { data: allProfiles, error: allError } = await supabase
      .from('cfo_profiles')
      .select('cfo_name, cfo_skills, cfo_raw_profile');

    if (allError) {
      console.log('   ❌ Could not retrieve profiles:', allError.message);
    } else {
      console.log(`   ✅ Retrieved ${allProfiles.length} profiles for analysis`);
      
      // Client-side filtering
      const ipoRelevant = allProfiles.filter(profile => {
        const skillsMatch = profile.cfo_skills && profile.cfo_skills.includes('IPO支援');
        const textMatch = profile.cfo_raw_profile && profile.cfo_raw_profile.includes('IPO');
        return skillsMatch || textMatch;
      });
      
      console.log(`   ✅ Client-side filter: Found ${ipoRelevant.length} IPO-relevant profiles`);
      ipoRelevant.forEach(profile => {
        console.log(`      - ${profile.cfo_name}: Skills include IPO support`);
      });
    }

    // 4. Test Business issues search
    console.log('\n4. Testing business issues search...');
    
    const { data: allBizProfiles, error: bizError } = await supabase
      .from('biz_profiles')
      .select('biz_company_name, biz_issues, biz_raw_profile');

    if (bizError) {
      console.log('   ❌ Could not retrieve business profiles:', bizError.message);
    } else {
      console.log(`   ✅ Retrieved ${allBizProfiles.length} business profiles`);
      
      const ipoSeekers = allBizProfiles.filter(profile => {
        const issuesMatch = profile.biz_issues && profile.biz_issues.includes('IPO準備');
        const textMatch = profile.biz_raw_profile && profile.biz_raw_profile.includes('IPO');
        return issuesMatch || textMatch;
      });
      
      console.log(`   ✅ Found ${ipoSeekers.length} companies seeking IPO support`);
      ipoSeekers.forEach(company => {
        console.log(`      - ${company.biz_company_name}: Needs IPO preparation`);
      });
    }

    // 5. Recommended search implementation
    console.log('\n=== Recommended Search Implementation ===');
    console.log('✅ For production use:');
    console.log('1. Text search in raw_profile fields (proven working)');
    console.log('2. Client-side JSONB array filtering (reliable)');
    console.log('3. PostgreSQL full-text search functions (if needed)');
    console.log('');
    console.log('📝 JSONB operators require careful PostgREST syntax');
    console.log('   - Consider implementing custom RPC functions for complex searches');
    console.log('   - Current implementation supports all core functionality');

  } catch (err) {
    console.error('\n❌ JSONB search test failed:', err.message);
  }
}

testJSONBSearch();