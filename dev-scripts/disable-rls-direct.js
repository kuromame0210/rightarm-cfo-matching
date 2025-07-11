// Disable RLS using direct SQL queries
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableRLSDirect() {
  console.log('🔓 Disabling RLS using direct SQL...\n')
  
  try {
    // Check current RLS status
    console.log('📋 Current RLS status:')
    const { data: currentStatus, error: statusError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .like('tablename', 'rextrix_%')
    
    if (statusError) {
      console.log('❌ Error checking RLS status:', statusError.message)
    } else {
      console.table(currentStatus)
    }
    
    // Since we can't execute ALTER statements directly through the client,
    // let's try a different approach - use the service role to insert
    console.log('\n🔧 Testing direct insert with service role...')
    
    const testData = {
      supabase_auth_id: 'test-auth-id-' + Date.now(),
      email: 'test-service@example.com',
      user_type: 'cfo',
      status: 'active',
      email_verified: true,
      auth_provider: 'supabase'
    }
    
    const { data: insertResult, error: insertError } = await supabase
      .from('rextrix_users')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message)
      console.log('This confirms RLS is blocking inserts')
    } else {
      console.log('✅ Insert test succeeded:', insertResult)
      
      // Clean up test data
      await supabase
        .from('rextrix_users')
        .delete()
        .eq('supabase_auth_id', testData.supabase_auth_id)
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
  
  console.log('\n📝 To disable RLS, please run this SQL in Supabase Dashboard:')
  console.log(`
-- Run in Supabase SQL Editor:
ALTER TABLE rextrix_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_cfos DISABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_companies DISABLE ROW LEVEL SECURITY;
  `)
}

disableRLSDirect().catch(console.error)