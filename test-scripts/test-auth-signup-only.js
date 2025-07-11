// Test only the Supabase Auth signup step
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthSignupOnly() {
  console.log('🔐 Testing Supabase Auth signup only...\n')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'test123456'
  
  try {
    console.log('📧 Testing with email:', testEmail)
    console.log('🔑 Testing with password:', testPassword)
    
    // Test auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          user_type: 'cfo',
          display_name: 'Test Auth User'
        }
      }
    })
    
    console.log('\n📊 Auth signup result:')
    console.log('Error:', authError)
    console.log('Data:', JSON.stringify(authData, null, 2))
    
    if (authError) {
      console.log('\n❌ Auth signup failed:', authError.message)
      return
    }
    
    if (authData.user) {
      console.log('\n✅ Auth user created successfully')
      console.log('User ID:', authData.user.id)
      console.log('Email confirmed:', authData.user.email_confirmed_at !== null)
      console.log('Session exists:', authData.session !== null)
      
      // Try to sign in immediately if no session
      if (!authData.session) {
        console.log('\n🔄 No session returned, trying immediate sign-in...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })
        
        if (signInError) {
          console.log('❌ Immediate sign-in failed:', signInError.message)
        } else {
          console.log('✅ Immediate sign-in succeeded')
          console.log('Session exists:', signInData.session !== null)
        }
      }
      
      // Clean up: delete the test user
      if (authData.user.id) {
        console.log('\n🧹 Cleaning up test user...')
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
        if (deleteError) {
          console.log('❌ Cleanup failed:', deleteError.message)
        } else {
          console.log('✅ Test user deleted')
        }
      }
      
    } else {
      console.log('\n❌ No user data returned')
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testAuthSignupOnly().catch(console.error)