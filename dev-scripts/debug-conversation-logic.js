// Debug the conversation user type detection logic
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const TABLES = {
  USERS: 'rextrix_users',
  CFOS: 'rextrix_cfos',
  COMPANIES: 'rextrix_companies',
  CONVERSATIONS: 'rextrix_conversations'
};

async function debugConversationLogic() {
  console.log('🔍 Debugging conversation user type detection logic\n');
  
  // Test user ID (using the first user from our data)
  const testUserId = 'f3e021ee-13f4-469c-a350-49838c4543ae';
  
  console.log(`Testing with user ID: ${testUserId}\n`);
  
  // Get conversations for this user
  const { data: conversations, error } = await supabaseAdmin
    .from(TABLES.CONVERSATIONS)
    .select(`
      id,
      participant1_id,
      participant2_id,
      last_message_at,
      created_at
    `)
    .or(`participant1_id.eq.${testUserId},participant2_id.eq.${testUserId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('❌ Conversations fetch error:', error);
    return;
  }

  console.log(`Found ${conversations?.length || 0} conversations\n`);

  // Process each conversation to test the user type detection
  for (const conv of conversations || []) {
    console.log(`🗣️  Processing conversation: ${conv.id}`);
    
    const otherUserId = conv.participant1_id === testUserId ? conv.participant2_id : conv.participant1_id;
    console.log(`   Other user ID: ${otherUserId}`);
    
    // Get other user info
    const { data: otherUser } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id, email, user_type')
      .eq('id', otherUserId)
      .single();

    console.log(`   Other user info:`, otherUser);
    
    // Check CFO profile
    console.log(`   Checking CFO profile for user ${otherUserId}...`);
    const { data: cfoProfile, error: cfoError } = await supabaseAdmin
      .from(TABLES.CFOS)
      .select('id, user_id, name, nickname')
      .eq('user_id', otherUserId)
      .single();

    console.log(`   CFO profile result:`, { cfoProfile, cfoError: cfoError?.message });
    
    // Check Company profile
    console.log(`   Checking Company profile for user ${otherUserId}...`);
    const { data: companyProfile, error: companyError } = await supabaseAdmin
      .from(TABLES.COMPANIES)
      .select('id, user_id, company_name')
      .eq('user_id', otherUserId)
      .single();

    console.log(`   Company profile result:`, { companyProfile, companyError: companyError?.message });
    
    // Determine user type based on API logic
    let userType = 'unknown';
    let profileName = otherUser?.email || '不明なユーザー';
    let profileId = null;
    
    if (cfoProfile && !cfoError) {
      profileName = cfoProfile.name || cfoProfile.nickname || otherUser?.email || 'CFO';
      userType = 'cfo';
      profileId = cfoProfile.id;
    } else if (companyProfile && !companyError) {
      profileName = companyProfile.company_name || otherUser?.email || '企業';
      userType = 'company';
      profileId = companyProfile.id;
    }
    
    console.log(`   Final result: userType=${userType}, profileName=${profileName}, profileId=${profileId}`);
    console.log(`   =====================================\n`);
  }
}

debugConversationLogic().catch(console.error);