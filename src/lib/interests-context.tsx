'use client'

// お気に入り機能統一コンテキスト
// Phase 3: Interests Functionality Unification

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { api, isSuccessResponse, ApiError, apiClient } from './api-client'
import { useSession } from 'next-auth/react'

// 設計書準拠: Likesテーブルの型定義
export interface LikeItem {
  likerId: string      // liker_id
  targetId: string     // target_id
  targetName: string   // 表示用: 相手の名前
  targetType: 'cfo' | 'company'  // 表示用: 相手のタイプ
  targetAvatar: string // 表示用: 相手のアバター
  createdAt: string
  meta: {
    architecture: string
    table: string
  }
}

// コンテキストの型定義
interface InterestsContextType {
  interests: LikeItem[]
  loading: boolean
  error: string | null
  
  // お気に入りチェック
  isInterested: (targetUserId: string) => boolean
  
  // お気に入り操作
  addInterest: (targetUserId: string, targetType: 'cfo' | 'company') => Promise<boolean>
  removeInterest: (targetUserId: string) => Promise<boolean>
  toggleInterest: (targetUserId: string, targetType: 'cfo' | 'company') => Promise<boolean>
  
  // データ更新
  refetchInterests: () => Promise<void>
  
  // 統計情報
  getInterestStats: () => {
    totalCount: number
    cfoCount: number
    companyCount: number
  }
}

const InterestsContext = createContext<InterestsContextType | undefined>(undefined)

// プロバイダープロパティ
interface InterestsProviderProps {
  children: React.ReactNode
}

export function InterestsProvider({ children }: InterestsProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const { data: session } = useSession()
  const [interests, setInterests] = useState<LikeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // セッション情報をAPIクライアントに更新
  useEffect(() => {
    if (session) {
      apiClient.updateSession(session)
    }
  }, [session])

  // APIからお気に入りリストを取得
  const fetchInterests = useCallback(async () => {
    if (!isAuthenticated || !user || !session) {
      setInterests([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // セッション情報を確実にAPIクライアントに設定
      apiClient.updateSession(session)

      const response = await api.interests.list()
      
      if (isSuccessResponse(response)) {
        // 新アーキテクチャ: response.dataから取得
        const interestsData = response.data || []
        
        // データ形式の確認と変換
        let processedData: LikeItem[] = []
        if (Array.isArray(interestsData)) {
          processedData = interestsData
        } else if (interestsData.likes && Array.isArray(interestsData.likes)) {
          processedData = interestsData.likes
        } else {
          console.warn('API response.data is not in expected format:', interestsData)
          processedData = []
        }
        
        setInterests(processedData)
      } else {
        throw new Error(response.error?.message || '気になるリストの取得に失敗しました')
      }
    } catch (err) {
      console.error('Interests fetch error:', err)
      
      // 401エラーの場合は認証状態をチェック
      if (err instanceof ApiError && err.status === 401) {
        console.warn('⚠️  Authentication error detected')
        setError('認証エラーが発生しました。再度ログインしてください。')
      } else {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
        }
      }
      
      // エラー時は空の配列を設定
      setInterests([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, session])

  // 初期データ読み込み（認証完了後のみ）
  useEffect(() => {
    if (isAuthenticated && user) {
      // セッション同期を待つため少し遅延
      const timer = setTimeout(() => {
        fetchInterests()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [fetchInterests, isAuthenticated, user])

  // お気に入りかどうかをチェック
  const isInterested = useCallback((targetUserId: string): boolean => {
    if (!Array.isArray(interests)) {
      console.warn('interests is not an array:', interests)
      return false
    }
    return interests.some(interest => interest.targetId === targetUserId)
  }, [interests])

  // お気に入りに追加
  const addInterest = useCallback(async (
    targetUserId: string, 
    targetType: 'cfo' | 'company'
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || !session) {
      setError('認証が必要です')
      return false
    }

    // 既に追加済みかチェック
    if (isInterested(targetUserId)) {
      console.log('Already interested in:', targetUserId)
      return true
    }

    try {
      setError(null)

      // セッション情報を確実にAPIクライアントに設定
      apiClient.updateSession(session)

      const response = await api.interests.add(targetUserId, targetType)

      if (isSuccessResponse(response)) {
        // ローカル状態を更新（新アーキテクチャ準拠）
        const newLike: LikeItem = {
          likerId: response.data.likerId || session.user.id,
          targetId: response.data.targetId || targetUserId,
          targetName: 'Unknown', // 実際の実装では詳細情報を取得
          targetType: targetType,
          targetAvatar: '',
          createdAt: response.data.createdAt || new Date().toISOString(),
          meta: {
            architecture: 'new',
            table: 'likes'
          }
        }
        setInterests(prev => {
          if (!Array.isArray(prev)) {
            console.warn('Previous interests is not an array, resetting:', prev)
            return [newLike]
          }
          return [...prev, newLike]
        })
        
        console.log('Like added:', newLike)
        return true
      } else {
        throw new Error(response.error?.message || 'お気に入りの追加に失敗しました')
      }
    } catch (err) {
      console.error('Add interest error:', err)
      
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : '追加に失敗しました')
      }
      return false
    }
  }, [isAuthenticated, user, session, isInterested])

  // お気に入りから削除
  const removeInterest = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!isAuthenticated || !user || !session) {
      setError('認証が必要です')
      return false
    }

    try {
      setError(null)

      // セッション情報を確実にAPIクライアントに設定
      apiClient.updateSession(session)

      const response = await api.interests.remove(targetUserId)

      if (isSuccessResponse(response)) {
        // ローカル状態を更新（新アーキテクチャ準拠）
        setInterests(prev => {
          if (!Array.isArray(prev)) {
            console.warn('Previous interests is not an array, resetting:', prev)
            return []
          }
          return prev.filter(interest => interest.targetId !== targetUserId)
        })
        
        console.log('Like removed:', targetUserId)
        return true
      } else {
        throw new Error(response.error?.message || 'お気に入りの削除に失敗しました')
      }
    } catch (err) {
      console.error('Remove interest error:', err)
      
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : '削除に失敗しました')
      }
      return false
    }
  }, [isAuthenticated, user, session])

  // お気に入りのトグル
  const toggleInterest = useCallback(async (
    targetUserId: string, 
    targetType: 'cfo' | 'company'
  ): Promise<boolean> => {
    if (isInterested(targetUserId)) {
      return await removeInterest(targetUserId)
    } else {
      return await addInterest(targetUserId, targetType)
    }
  }, [isInterested, removeInterest, addInterest])

  // 統計情報を取得
  const getInterestStats = useCallback(() => {
    const cfoCount = interests.filter(i => i.targetType === 'cfo').length
    const companyCount = interests.filter(i => i.targetType === 'company').length
    
    return {
      totalCount: interests.length,
      cfoCount,
      companyCount
    }
  }, [interests])

  const contextValue: InterestsContextType = {
    interests,
    loading,
    error,
    isInterested,
    addInterest,
    removeInterest,
    toggleInterest,
    refetchInterests: fetchInterests,
    getInterestStats
  }

  return (
    <InterestsContext.Provider value={contextValue}>
      {children}
    </InterestsContext.Provider>
  )
}

// カスタムフック
export function useInterests(): InterestsContextType {
  const context = useContext(InterestsContext)
  if (context === undefined) {
    throw new Error('useInterests must be used within an InterestsProvider')
  }
  return context
}