// Real Database Test for CFOs API
import { GET } from './route'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

describe('GET /api/cfos - Real Database Tests', () => {
  
  beforeAll(async () => {
    // Verify real database connection
    const isConnected = await global.DatabaseTestUtils.verifyConnection(supabaseAdmin)
    expect(isConnected).toBe(true)
  })

  afterEach(async () => {
    // Clean up any test data we might have created
    await global.DatabaseTestUtils.cleanupTestData(supabaseAdmin, [TABLES.CFOS, TABLES.USERS])
  })

  it('should fetch real CFO data successfully', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/cfos?page=1&limit=5')
    
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
      const cfo = responseData.data[0]
      expect(cfo).toHaveProperty('id')
      expect(cfo).toHaveProperty('name')
      expect(cfo).toHaveProperty('skills')
      expect(cfo).toHaveProperty('available')
      expect(cfo).toHaveProperty('rating')
      expect(Array.isArray(cfo.skills)).toBe(true)
    }
    
    console.log(`✅ Retrieved ${responseData.data.length} CFOs from database`)
  })

  it('should handle pagination correctly with real data', async () => {
    // Test first page
    const request1 = global.createRealRequest('http://localhost:3000/api/cfos?page=1&limit=2')
    const response1 = await GET(request1)
    const data1 = await response1.json()
    
    expect(response1.status).toBe(200)
    expect(data1.pagination.page).toBe(1)
    expect(data1.pagination.limit).toBe(2)
    
    // Test second page  
    const request2 = global.createRealRequest('http://localhost:3000/api/cfos?page=2&limit=2')
    const response2 = await GET(request2)
    const data2 = await response2.json()
    
    expect(response2.status).toBe(200)
    expect(data2.pagination.page).toBe(2)
    expect(data2.pagination.limit).toBe(2)
    
    console.log(`✅ Pagination working: Page 1 has ${data1.data.length} records, Page 2 has ${data2.data.length} records, Total: ${data1.pagination.total}`)
    
    // Just verify pagination structure works, don't assume different data
    expect(data1.pagination).toHaveProperty('total')
    expect(data1.pagination).toHaveProperty('totalPages')
    expect(data2.pagination).toHaveProperty('total')
    expect(data2.pagination).toHaveProperty('totalPages')
  })

  it('should filter by availability status', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/cfos?available=true&limit=10')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    
    // All returned CFOs should be available
    responseData.data.forEach((cfo: any) => {
      expect(cfo.available).toBe(true)
    })
    
    console.log(`✅ Found ${responseData.data.length} available CFOs`)
  })

  it('should handle search functionality', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/cfos?search=CFO&limit=5')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    
    console.log(`✅ Search for "CFO" returned ${responseData.data.length} results`)
  })

  it('should return valid data structure for each CFO', async () => {
    const request = global.createRealRequest('http://localhost:3000/api/cfos?limit=3')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    
    responseData.data.forEach((cfo: any, index: number) => {
      expect(typeof cfo.id).toBe('string')
      expect(typeof cfo.name).toBe('string')
      expect(typeof cfo.available).toBe('boolean')
      expect(typeof cfo.rating).toBe('number')
      expect(Array.isArray(cfo.skills)).toBe(true)
      expect(Array.isArray(cfo.certifications)).toBe(true)
      
      console.log(`✅ CFO ${index + 1}: ${cfo.name} - Available: ${cfo.available} - Rating: ${cfo.rating}`)
    })
  })

  it('should handle empty results gracefully', async () => {
    // Search for something that likely doesn't exist
    const request = global.createRealRequest('http://localhost:3000/api/cfos?search=NonexistentSearchTerm12345&limit=10')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    expect(responseData.pagination).toBeDefined()
    
    console.log(`✅ Empty search handled gracefully: ${responseData.data.length} results`)
  })

  it('should verify database relationships are working', async () => {
    // This test verifies that the API properly joins related tables
    const request = global.createRealRequest('http://localhost:3000/api/cfos?limit=1')
    
    const response = await GET(request)
    const responseData = await response.json()
    
    expect(response.status).toBe(200)
    
    if (responseData.data.length > 0) {
      const cfo = responseData.data[0]
      
      // Should have data from multiple related tables
      expect(cfo.name).toBeDefined() // From user profile
      expect(cfo.skills).toBeDefined() // From CFO skills/services
      expect(cfo.certifications).toBeDefined() // From CFO certifications
      expect(cfo.workPreference).toBeDefined() // From CFO profile
      
      console.log(`✅ Relationships working - CFO ${cfo.name} has ${cfo.skills.length} skills and ${cfo.certifications.length} certifications`)
    }
  })

})