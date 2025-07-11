import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { AUTH_CONFIG } from "@/lib/auth/unified-auth"

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname
    const isAuthenticated = !!req.nextauth.token

    // 認証済みユーザーが認証不要ページ（ログイン・登録）にアクセスした場合
    if (AUTH_CONFIG.PUBLIC_ONLY_PATHS.includes(pathname) && isAuthenticated) {
      const userType = req.nextauth.token?.userType as 'company' | 'cfo'
      const defaultPath = userType === 'company' ? '/discover/cfos' : '/discover/companies'
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 認証済みユーザー(${userType})を${defaultPath}にリダイレクト`)
      }
      
      return NextResponse.redirect(new URL(defaultPath, req.url))
    }

    // 認証状態のログ出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development' && !req.nextauth.token) {
      console.log(`🚫 未認証アクセス: ${pathname}`)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // NextAuth.jsのAPIルートは常に許可
        if (pathname.startsWith('/api/auth/')) {
          return true
        }

        // 常に公開のパスは認証不要
        if (AUTH_CONFIG.PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
          return true
        }

        // 保護されたルートは認証とアクティブ状態が必要
        const isProtected = AUTH_CONFIG.PROTECTED_PATHS.some(path => pathname.startsWith(path))
        
        if (isProtected) {
          const hasValidToken = !!token && token.status === 'active'
          
          if (process.env.NODE_ENV === 'development' && !hasValidToken) {
            console.log(`🚫 保護されたルート ${pathname} へのアクセス拒否:`, {
              hasToken: !!token,
              status: token?.status || 'none',
              userType: token?.userType || 'none'
            })
          }
          
          return hasValidToken
        }

        // その他のルートは認証不要
        return true
      },
    },
    pages: {
      signIn: '/auth/login',
    }
  }
)

export const config = {
  matcher: [
    // 全ルートを対象にして、認証判定はauthorized callbackで行う
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}