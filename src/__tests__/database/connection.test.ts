// Real Database Connection Tests
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

describe('Database Connection Tests', () => {
  
  beforeAll(async () => {
    // Verify we're using real database connection
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toContain('supabase.co')
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
  })

  it('should connect to Supabase successfully', async () => {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('count')
      .limit(1)
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('should verify all required tables exist', async () => {
    const tablesToTest = [
      TABLES.USERS,
      TABLES.USER_PROFILES, 
      TABLES.COMPANIES,
      TABLES.CFOS,
      TABLES.SKILL_TAGS,
      TABLES.CHALLENGE_TAGS,
      TABLES.CONTRACTS,
      TABLES.INVOICES,
      TABLES.PAYMENTS
    ]

    for (const table of tablesToTest) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      console.log(`✅ Table ${table} accessible`)
    }
  })

  it('should be able to read data from users table', async () => {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id, email, user_type, status')
      .limit(5)
    
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('email')
      expect(data[0]).toHaveProperty('user_type')
      expect(data[0]).toHaveProperty('status')
    }
  })

  it('should be able to read data from CFOs table', async () => {
    const { data, error } = await supabaseAdmin
      .from(TABLES.CFOS)
      .select('id, user_id, is_available, rating')
      .limit(5)
    
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('user_id')
      expect(data[0]).toHaveProperty('is_available')
      expect(data[0]).toHaveProperty('rating')
    }
  })

  it('should be able to read data from companies table', async () => {
    const { data, error } = await supabaseAdmin
      .from(TABLES.COMPANIES)
      .select('id, user_id, company_name, industry')
      .limit(5)
    
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('user_id')
      expect(data[0]).toHaveProperty('company_name')
    }
  })

  it('should test table relationships', async () => {
    // Test user -> profile relationship
    const { data: usersWithProfiles, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select(`
        id,
        email,
        ${TABLES.USER_PROFILES}(display_name, nickname)
      `)
      .limit(3)
    
    expect(error).toBeNull()
    expect(Array.isArray(usersWithProfiles)).toBe(true)
    console.log('✅ User-Profile relationship working')
  })

  it('should test CFO data with relations', async () => {
    const { data: cfosWithData, error } = await supabaseAdmin
      .from(TABLES.CFOS)
      .select(`
        id,
        user_id,
        is_available,
        rating,
        ${TABLES.USERS}(email, user_type)
      `)
      .limit(3)
    
    expect(error).toBeNull()
    expect(Array.isArray(cfosWithData)).toBe(true)
    console.log('✅ CFO-User relationship working')
  })

})