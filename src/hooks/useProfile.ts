'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export interface ProfileData {
  id?: string
  email?: string
  userType?: 'cfo' | 'company'
  name?: string
  displayName?: string // 互換性
  phoneNumber?: string
  phone?: string // 互換性
  address?: string
  region?: string // 互換性
  location?: string // 互換性
  introduction?: string
  bio?: string // 互換性
  profileImageUrl?: string
  // CFO固有
  title?: string
  experience?: string
  rawProfile?: string // API返却データ
  specialties?: string[]
  skills?: string[] // 互換性
  certifications?: string[]
  hourlyRate?: number
  availabilityStatus?: string
  workPreference?: string // 互換性
  workStyle?: string // 互換性
  feeMin?: number
  feeMax?: number
  availableAreas?: string[]
  weeklyAvailability?: string
  career?: string
  monthlyFeeMin?: number | null
  monthlyFeeMax?: string
  // Company固有
  companyName?: string
  company?: string // 互換性
  industry?: string
  employeeCount?: number
  foundedYear?: number
  website?: string
  description?: string
  position?: string // 互換性
  compensation?: string // 互換性
  compensationRange?: string // 互換性
  availability?: string // 互換性
  // 会社情報の4項目
  revenueRange?: string
  challengeBackground?: string
}

export function useProfile() {
  const { isAuthenticated, user } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [retryCount, setRetryCount] = useState<number>(0)

  // プロフィール取得（重複呼び出し防止版）
  const fetchProfile = useCallback(async () => {
    const callId = Math.random().toString(36).substr(2, 9)
    const now = Date.now()
    
    console.log(`🚀 useProfile[${callId}]: fetchProfile called`, {
      isAuthenticated,
      loading,
      retryCount,
      timeSinceLastFetch: now - lastFetchTime,
      timestamp: new Date().toISOString()
    })

    if (!isAuthenticated) {
      console.log(`⛔ useProfile[${callId}]: Not authenticated, stopping`)
      setLoading(false)
      setRetryCount(0)
      return
    }

    // 重複呼び出し防止（時間ベース + 状態ベース）
    if (loading) {
      console.log(`⏳ useProfile[${callId}]: Already loading, skipping`)
      return
    }

    // 短時間での連続呼び出し防止（5秒以内）
    if (now - lastFetchTime < 5000) {
      console.log(`⏱️ useProfile[${callId}]: Too soon since last fetch (${now - lastFetchTime}ms), skipping`)
      return
    }

    // 無限ループ防止（10回以上の連続リトライ）
    if (retryCount >= 10) {
      console.error(`🛑 useProfile[${callId}]: Max retry count exceeded (${retryCount}), stopping`)
      setError('プロフィールの取得に繰り返し失敗しています。ページを更新してください。')
      setLoading(false)
      return
    }

    try {
      console.log(`📥 useProfile[${callId}]: Starting profile fetch`)
      setLoading(true)
      setError(null)

      const response = await fetch('/api/profile', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      console.log(`📡 useProfile[${callId}]: Response status:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📄 useProfile[${callId}]: Response data:`, {
          success: data.success,
          hasProfile: !!data.profile,
          profileId: data.profile?.id
        })
        
        if (data.success) {
          console.log(`✅ useProfile[${callId}]: Profile fetch successful`)
          setProfile(data.profile)
          setRetryCount(0) // 成功時にリトライカウントをリセット
        } else {
          console.error(`❌ useProfile[${callId}]: API error:`, data.error)
          setError(data.error || 'プロフィールの取得に失敗しました')
          setRetryCount(prev => prev + 1)
        }
      } else {
        const errorData = await response.json()
        console.error(`❌ useProfile[${callId}]: HTTP error ${response.status}:`, errorData)
        setError(errorData.error || 'プロフィールの取得に失敗しました')
        setRetryCount(prev => prev + 1)
      }
    } catch (err) {
      console.error(`❌ useProfile[${callId}]: Network error:`, err)
      setError('ネットワークエラーが発生しました')
      setRetryCount(prev => prev + 1)
    } finally {
      console.log(`🏁 useProfile[${callId}]: fetchProfile completed, setting loading = false`)
      setLoading(false)
      setLastFetchTime(now)
    }
  }, [isAuthenticated, loading, lastFetchTime, retryCount])

  // プロフィール更新
  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    try {
      console.log('🔥 保存処理開始:', profileData.name || profileData.displayName)
      console.log('📤 送信するデータ:', JSON.stringify(profileData, null, 2))

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })

      const result = await response.json()
      console.log('📡 API応答:', result.success ? '成功' : `失敗: ${result.error}`)

      if (response.ok && result.success) {
        console.log('✅ プロフィール更新API成功')
        // 更新成功後にプロフィールを再取得
        await fetchProfile()
        console.log('🔄 データ再取得完了')
        return { success: true, message: result.message }
      } else {
        console.error('❌ プロフィール更新API失敗:', result.error)
        return { 
          success: false, 
          error: result.error || 'プロフィールの更新に失敗しました' 
        }
      }
    } catch (err) {
      console.error('useProfile update error:', err)
      return { 
        success: false, 
        error: 'ネットワークエラーが発生しました' 
      }
    }
  }, [fetchProfile])

  // 初回ロード
  useEffect(() => {
    console.log('🔄 useProfile: useEffect triggered, calling fetchProfile')
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    refetch: fetchProfile
  }
}

// マスターデータ用フック
export function useMasterData() {
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [workStyles, setWorkStyles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMasterData = useCallback(async () => {
    try {
      console.log('📋 === useMasterData: マスターデータ取得開始 ===')
      setLoading(true)

      const [skillsRes, regionsRes, workStylesRes] = await Promise.all([
        fetch('/api/master/skills?category=finance', { credentials: 'include' }),
        fetch('/api/master/regions?popular=true', { credentials: 'include' }),
        fetch('/api/master/work-styles?popular=true', { credentials: 'include' })
      ])

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        if (skillsData.success) {
          const skills = skillsData.data.skills?.map((skill: any) => skill.name) || []
          setAvailableSkills(skills)
        }
      }

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json()
        if (regionsData.success) {
          setLocations(regionsData.data.regions || [])
        }
      }

      if (workStylesRes.ok) {
        const workStylesData = await workStylesRes.json()
        if (workStylesData.success) {
          setWorkStyles(workStylesData.data.workStyles || [])
        }
      }

      console.log('✅ useMasterData: 取得完了')
    } catch (error) {
      console.error('Master data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  return {
    availableSkills,
    locations,
    workStyles,
    loading,
    refetch: fetchMasterData
  }
}