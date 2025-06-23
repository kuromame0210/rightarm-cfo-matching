'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  userType: 'company' | 'cfo'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: {
    email: string
    password: string
    name: string
    userType: 'company' | 'cfo'
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化時にローカルストレージから認証状態を復元
  useEffect(() => {
    const savedUser = localStorage.getItem('rightarm_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // 実際のプロダクションではFirebase認証を使用
      // ここでは簡易的なシミュレーション
      if (email && password) {
        const mockUser: User = {
          id: '1',
          name: email.split('@')[0],
          email,
          userType: email.includes('cfo') ? 'cfo' : 'company'
        }
        setUser(mockUser)
        localStorage.setItem('rightarm_user', JSON.stringify(mockUser))
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    userType: 'company' | 'cfo'
  }) => {
    setIsLoading(true)
    try {
      // 実際のプロダクションではFirebase認証を使用
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        userType: userData.userType
      }
      setUser(newUser)
      localStorage.setItem('rightarm_user', JSON.stringify(newUser))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rightarm_user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}