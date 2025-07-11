// Temporarily disable RLS for development
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableRLS() {
  console.log('🔓 Temporarily disabling RLS for development...\n')
  
  const tables = [
    'rextrix_users',
    'rextrix_user_profiles', 
    'rextrix_cfos',
    'rextrix_companies',
    'rextrix_cfo_skills',
    'rextrix_company_challenges'
  ]
  
  for (const table of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      })
      
      if (error) {
        console.log(`❌ ${table}:`, error.message)
      } else {
        console.log(`✅ ${table}: RLS disabled`)
      }
    } catch (err) {
      console.log(`❌ ${table}:`, err.message)
    }
  }
  
  console.log('\n🎯 RLS無効化完了!')
  console.log('⚠️  注意: 本番環境では適切なRLSポリシーを設定してください')
}

disableRLS().catch(console.error)