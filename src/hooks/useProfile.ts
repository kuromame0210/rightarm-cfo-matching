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
    const now = Date.now()

    if (!isAuthenticated) {
      setLoading(false)
      setRetryCount(0)
      return
    }

    // 重複呼び出し防止（時間ベース + 状態ベース）
    if (loading) {
      return
    }

    // 短時間での連続呼び出し防止（10秒以内に変更）
    if (now - lastFetchTime < 10000) {
      return
    }

    // 無限ループ防止（5回以上の連続リトライで停止）
    if (retryCount >= 5) {
      setError('プロフィールの取得に繰り返し失敗しています。ページを更新してください。')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/profile', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setProfile(data.profile)
          setRetryCount(0) // 成功時にリトライカウントをリセット
        } else {
          setError(data.error || 'プロフィールの取得に失敗しました')
          setRetryCount(prev => prev + 1)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'プロフィールの取得に失敗しました')
        setRetryCount(prev => prev + 1)
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
      setLastFetchTime(now)
    }
  }, [isAuthenticated, loading])

  // プロフィール更新
  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // 更新成功後にプロフィールを再取得
        await fetchProfile()
        return { success: true, message: result.message }
      } else {
        return { 
          success: false, 
          error: result.error || 'プロフィールの更新に失敗しました' 
        }
      }
    } catch (err) {
      return { 
        success: false, 
        error: 'ネットワークエラーが発生しました' 
      }
    }
  }, [fetchProfile])

  // 初回ロード
  useEffect(() => {
    fetchProfile()
  }, [isAuthenticated, user])

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
    } catch (error) {
      // Silent error handling
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