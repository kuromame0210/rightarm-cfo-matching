// お気に入り機能 - リアルデータベース接続テスト
import { GET, POST, DELETE } from './route'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

describe('Interests API - Real Database Tests', () => {
  let testUser1: any
  let testUser2: any
  let testCFO: any
  let testInterest: any

  beforeAll(async () => {
    // データベース接続確認
    const isConnected = await global.DatabaseTestUtils.verifyConnection(supabaseAdmin)
    if (!isConnected) {
      throw new Error('❌ データベースに接続できません。テスト環境を確認してください。')
    }
    console.log('✅ データベース接続確認完了')
  })

  beforeEach(async () => {
    // テストデータ準備
    console.log('🔧 テストデータ準備中...')

    // テストユーザー1作成（企業）
    const { data: user1, error: user1Error } = await global.DatabaseTestUtils.createTestUser(
      supabaseAdmin,
      {
        user_type: 'company',
        status: 'active'
      }
    )
    if (user1Error) throw new Error(`テストユーザー1作成失敗: ${user1Error.message}`)
    testUser1 = user1

    // テストユーザー2作成（CFO）
    const { data: user2, error: user2Error } = await global.DatabaseTestUtils.createTestUser(
      supabaseAdmin,
      {
        user_type: 'cfo',
        status: 'active'
      }
    )
    if (user2Error) throw new Error(`テストユーザー2作成失敗: ${user2Error.message}`)
    testUser2 = user2

    // テストCFO作成
    const { data: cfo, error: cfoError } = await supabaseAdmin
      .from(TABLES.CFOS)
      .insert({
        user_id: testUser2.id,
        experience_years: 10,
        experience_summary: 'テスト用CFOプロフィール',
        achievements: ['テスト実績1', 'テスト実績2'],
        certifications: ['公認会計士', 'CFA'],
        is_available: true,
        max_concurrent_projects: 3,
        rating: 4.5,
        review_count: 10
      })
      .select()
      .single()
    
    if (cfoError) throw new Error(`テストCFO作成失敗: ${cfoError.message}`)
    testCFO = cfo

    console.log('✅ テストデータ準備完了')
    console.log(`  - ユーザー1(企業): ${testUser1.id} (${testUser1.email})`)
    console.log(`  - ユーザー2(CFO): ${testUser2.id} (${testUser2.email})`)
    console.log(`  - CFO: ${testCFO.id} (experience: ${testCFO.experience_years}年)`)
  })

  afterEach(async () => {
    // テストデータクリーンアップ
    console.log('🧹 テストデータクリーンアップ中...')

    try {
      // 作成された気になるデータを削除
      if (testInterest) {
        await supabaseAdmin
          .from(TABLES.INTERESTS)
          .delete()
          .eq('id', testInterest.id)
      }

      // テストCFOを削除
      if (testCFO) {
        await supabaseAdmin
          .from(TABLES.CFOS)
          .delete()
          .eq('id', testCFO.id)
      }

      // テストユーザーを削除
      if (testUser1) {
        await supabaseAdmin
          .from(TABLES.USERS)
          .delete()
          .eq('id', testUser1.id)
      }
      if (testUser2) {
        await supabaseAdmin
          .from(TABLES.USERS)
          .delete()
          .eq('id', testUser2.id)
      }

      console.log('✅ テストデータクリーンアップ完了')
    } catch (error) {
      console.error('⚠️  クリーンアップエラー:', error)
    }

    // リセット
    testUser1 = null
    testUser2 = null
    testCFO = null
    testInterest = null
  })

  describe('POST /api/interests - お気に入り追加', () => {
    it('✅ 実際のデータベースにお気に入りを追加できる', async () => {
      console.log('🧪 テスト: お気に入り追加')

      const request = global.createRealRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: testCFO.user_id,
          targetType: 'cfo',
        },
      })

      // デモトークン用のユーザー確認を設定
      // 実際のテストでは、testUser1のemailを使ってデモユーザーとして設定
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({ email: 'test@example.com' })
        .eq('id', testUser1.id)
      
      if (updateError) {
        console.error('ユーザーメール更新エラー:', updateError)
      }

      const response = await POST(request)
      const responseData = await response.json()

      console.log('📊 レスポンス:', {
        status: response.status,
        success: responseData.success,
        message: responseData.message
      })

      // アサーション
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('id')
      expect(responseData.data.target_user_id).toBe(testCFO.user_id)
      expect(responseData.data.target_type).toBe('cfo')
      expect(responseData.message).toBe('気になるに追加しました')

      // テスト用に保存
      testInterest = responseData.data

      // データベースに実際に保存されているか確認
      const { data: dbInterest, error: dbError } = await supabaseAdmin
        .from(TABLES.INTERESTS)
        .select('*')
        .eq('id', testInterest.id)
        .single()

      expect(dbError).toBeNull()
      expect(dbInterest).toBeTruthy()
      expect(dbInterest.target_user_id).toBe(testCFO.user_id)
      expect(dbInterest.target_type).toBe('cfo')

      console.log('✅ データベースに正常に保存されました')
    })

    it('❌ 重複するお気に入りは追加できない', async () => {
      console.log('🧪 テスト: 重複お気に入り防止')

      // 最初の追加
      const request1 = global.createRealRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: testCFO.user_id,
          targetType: 'cfo',
        },
      })

      // デモトークン用ユーザー設定
      await supabaseAdmin
        .from(TABLES.USERS)
        .update({ email: 'test@example.com' })
        .eq('id', testUser1.id)

      const response1 = await POST(request1)
      const responseData1 = await response1.json()

      expect(response1.status).toBe(200)
      expect(responseData1.success).toBe(true)
      testInterest = responseData1.data

      // 重複追加
      const request2 = global.createRealRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: testCFO.user_id,
          targetType: 'cfo',
        },
      })

      const response2 = await POST(request2)
      const responseData2 = await response2.json()

      console.log('📊 重複追加レスポンス:', {
        status: response2.status,
        success: responseData2.success,
        error: responseData2.error
      })

      // 重複エラーのアサーション
      expect(response2.status).toBe(409)
      expect(responseData2.success).toBe(false)
      expect(responseData2.error).toBe('既に気になるに追加されています')

      console.log('✅ 重複防止が正常に動作しました')
    })
  })

  describe('GET /api/interests - お気に入りリスト取得', () => {
    it('✅ 実際のデータベースからお気に入りリストを取得できる', async () => {
      console.log('🧪 テスト: お気に入りリスト取得')

      // 事前にお気に入りを追加
      const { data: interest, error: addError } = await supabaseAdmin
        .from(TABLES.INTERESTS)
        .insert({
          user_id: testUser1.id,
          target_user_id: testCFO.user_id,
          target_type: 'cfo'
        })
        .select()
        .single()

      expect(addError).toBeNull()
      testInterest = interest

      // デモトークン用ユーザー設定
      await supabaseAdmin
        .from(TABLES.USERS)
        .update({ email: 'test@example.com' })
        .eq('id', testUser1.id)

      const request = global.createRealRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer demo-token',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      console.log('📊 取得レスポンス:', {
        status: response.status,
        success: responseData.success,
        dataLength: responseData.data?.length
      })

      // アサーション
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(Array.isArray(responseData.data)).toBe(true)
      expect(responseData.data.length).toBeGreaterThan(0)

      const foundInterest = responseData.data.find(
        (item: any) => item.id === testInterest.id
      )
      expect(foundInterest).toBeTruthy()
      expect(foundInterest.target_user_id).toBe(testCFO.user_id)
      expect(foundInterest.target_type).toBe('cfo')

      console.log('✅ お気に入りリスト正常取得完了')
    })
  })

  describe('DELETE /api/interests - お気に入り削除', () => {
    it('✅ 実際のデータベースからお気に入りを削除できる', async () => {
      console.log('🧪 テスト: お気に入り削除')

      // 事前にお気に入りを追加
      const { data: interest, error: addError } = await supabaseAdmin
        .from(TABLES.INTERESTS)
        .insert({
          user_id: testUser1.id,
          target_user_id: testCFO.user_id,
          target_type: 'cfo'
        })
        .select()
        .single()

      expect(addError).toBeNull()
      testInterest = interest

      // デモトークン用ユーザー設定
      await supabaseAdmin
        .from(TABLES.USERS)
        .update({ email: 'test@example.com' })
        .eq('id', testUser1.id)

      const request = global.createRealRequest(
        `http://localhost:3000/api/interests?targetUserId=${testCFO.user_id}`,
        {
          method: 'DELETE',
          headers: {
            'authorization': 'Bearer demo-token',
          },
        }
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      console.log('📊 削除レスポンス:', {
        status: response.status,
        success: responseData.success,
        message: responseData.message
      })

      // アサーション
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.message).toBe('気になるから削除しました')

      // データベースから実際に削除されているか確認
      const { data: deletedInterest, error: checkError } = await supabaseAdmin
        .from(TABLES.INTERESTS)
        .select('*')
        .eq('id', testInterest.id)
        .single()

      expect(checkError).toBeTruthy() // レコードが見つからないエラー
      expect(deletedInterest).toBeNull()

      console.log('✅ データベースから正常に削除されました')

      // クリーンアップ用にリセット
      testInterest = null
    })
  })

  describe('データベース接続エラーハンドリング', () => {
    it('⚠️ 無効なターゲットユーザーIDでのエラー処理', async () => {
      console.log('🧪 テスト: 無効ターゲットユーザーエラー')

      // デモトークン用ユーザー設定
      await supabaseAdmin
        .from(TABLES.USERS)
        .update({ email: 'test@example.com' })
        .eq('id', testUser1.id)

      const request = global.createRealRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: 'invalid-user-id-99999',
          targetType: 'cfo',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      console.log('📊 無効ユーザーレスポンス:', {
        status: response.status,
        success: responseData.success,
        error: responseData.error
      })

      // 外部キー制約エラーまたは500エラーが期待される
      expect([400, 500]).toContain(response.status)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBeTruthy()

      console.log('✅ 無効ユーザーID エラーハンドリング確認完了')
    })
  })

  describe('パフォーマンステスト', () => {
    it('⚡ 大量お気に入り処理のパフォーマンステスト', async () => {
      console.log('🧪 テスト: パフォーマンステスト')

      // デモトークン用ユーザー設定
      await supabaseAdmin
        .from(TABLES.USERS)
        .update({ email: 'test@example.com' })
        .eq('id', testUser1.id)

      const startTime = Date.now()

      // 10回の追加処理を実行
      const promises = []
      for (let i = 0; i < 5; i++) {
        const request = global.createRealRequest('http://localhost:3000/api/interests', {
          method: 'POST',
          headers: {
            'authorization': 'Bearer demo-token',
            'content-type': 'application/json',
          },
          body: {
            targetUserId: `test-cfo-${i}-${Date.now()}`,
            targetType: 'cfo',
          },
        })
        promises.push(POST(request))
      }

      const _responses = await Promise.allSettled(promises)
      const endTime = Date.now()
      const duration = endTime - startTime

      console.log(`📊 パフォーマンス結果:`)
      console.log(`  - 実行時間: ${duration}ms`)
      console.log(`  - 平均レスポンス時間: ${duration / promises.length}ms`)

      // パフォーマンス基準（5秒以内）
      expect(duration).toBeLessThan(5000)

      console.log('✅ パフォーマンステスト完了')
    }, 10000) // 10秒タイムアウト
  })
})