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

  // プロフィール取得（重複呼び出し防止版）
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    // 重複呼び出し防止
    if (loading) {
      console.log('⏳ useProfile: 既に取得中のためスキップ')
      return
    }

    try {
      console.log('📥 useProfile: プロフィール取得開始')
      setLoading(true)
      setError(null)

      const response = await fetch('/api/profile', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      console.log('📡 useProfile レスポンス:', response.status)

      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ useProfile: 取得成功')
          setProfile(data.profile)
        } else {
          console.error('❌ useProfile: APIエラー', data.error)
          setError(data.error || 'プロフィールの取得に失敗しました')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ useProfile: HTTPエラー', response.status, errorData)
        setError(errorData.error || 'プロフィールの取得に失敗しました')
      }
    } catch (err) {
      console.error('❌ useProfile: ネットワークエラー', err)
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, loading])

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