// Real Database Test for Companies API
import { GET } from './route'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

describe('GET /api/companies - Real Database Tests', () => {
  
  beforeAll(async () => {
    // Verify real database connection
    const isConnected = await global.DatabaseTestUtils.verifyConnection(supabaseAdmin)
    expect(isConnected).toBe(true)
  })

  afterEach(async () => {
    // Clean up any test data we might have created
    await global.DatabaseTestUtils.cleanupTestData(supabaseAdmin, [TABLES.COMPANIES, TABLES.USERS])
  })

  it('should fetch real company data successfully', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/companies?page=1&limit=5')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    expect(responseData.pagination).toBeDefined()
    expect(responseData.pagination.page).toBe(1)
    expect(responseData.pagination.limit).toBe(5)
    
    // Verify data structure
    if (responseData.data.length > 0) {
      const company = responseData.data[0]
      expect(company).toHaveProperty('id')
      expect(company).toHaveProperty('companyName')
      expect(company).toHaveProperty('industry')
      expect(company).toHaveProperty('challenges')
      expect(Array.isArray(company.challenges)).toBe(true)
    }
    
    console.log(`✅ Retrieved ${responseData.data.length} companies from database`)
  })

  it('should handle pagination correctly with real data', async () => {
    // Test first page
    const request1 = global.createRealRequest('http://localhost:3000/api/companies?page=1&limit=2')
    const response1 = await GET(request1)
    const data1 = await response1.json()
    
    expect(response1.status).toBe(200)
    expect(data1.pagination.page).toBe(1)
    expect(data1.pagination.limit).toBe(2)
    
    // Test second page
    const request2 = global.createRealRequest('http://localhost:3000/api/companies?page=2&limit=2')
    const response2 = await GET(request2)
    const data2 = await response2.json()
    
    expect(response2.status).toBe(200)
    expect(data2.pagination.page).toBe(2)
    expect(data2.pagination.limit).toBe(2)
    
    console.log(`✅ Pagination working: Page 1 has ${data1.data.length} records, Page 2 has ${data2.data.length} records`)
  })

  it('should return valid data structure for each company', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/companies?limit=3')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    
    responseData.data.forEach((company: any, index: number) => {
      expect(typeof company.id).toBe('string')
      expect(typeof company.companyName).toBe('string')
      expect(Array.isArray(company.challenges)).toBe(true)
      
      // Optional fields should be defined or null
      expect(company.industry !== undefined).toBe(true)
      expect(company.description !== undefined).toBe(true)
      expect(company.location !== undefined).toBe(true)
      
      console.log(`✅ Company ${index + 1}: ${company.companyName} - Industry: ${company.industry || 'N/A'} - Challenges: ${company.challenges.length}`)
    })
  })

  it('should verify database relationships are working', async () => {
    // This test verifies that the API properly joins related tables
    const request = global.createRealRequest('http://localhost:3000/api/companies?limit=1')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    
    if (responseData.data.length > 0) {
      const company = responseData.data[0]
      
      // Should have data from multiple related tables
      expect(company.companyName).toBeDefined() // From companies table
      expect(company.challenges).toBeDefined() // From company challenges relation
      expect(Array.isArray(company.challenges)).toBe(true)
      
      console.log(`✅ Relationships working - Company ${company.companyName} has ${company.challenges.length} challenges`)
    }
  })

  it('should handle search functionality', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/companies?search=株式会社&limit=5')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    
    console.log(`✅ Search for "株式会社" returned ${responseData.data.length} results`)
  })

  it('should handle empty results gracefully', async () => {
    // Search for something that likely doesn't exist
    const request = global.createRealRequest('http://localhost:3000/api/companies?search=NonexistentCompanyName12345&limit=10')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    expect(responseData.pagination).toBeDefined()
    
    console.log(`✅ Empty search handled gracefully: ${responseData.data.length} results`)
  })

})