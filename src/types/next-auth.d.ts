// NextAuth.js型拡張の一元化
// 統一認証システムの型安全性確保

import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string
    email: string
    name: string
    image?: string
    userType: 'company' | 'cfo'
    status: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name: string
      image?: string
      userType: 'company' | 'cfo'
      status: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId?: string
    userType?: 'company' | 'cfo'
    status?: string
    picture?: string
  }
}