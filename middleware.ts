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

    // 未認証ユーザーが保護されたルートにアクセスした場合、ログインページにリダイレクト
    const isProtected = AUTH_CONFIG.PROTECTED_PATHS.some(path => pathname.startsWith(path))
    if (isProtected && !isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚫 未認証ユーザーを /auth/login にリダイレクト: ${pathname}`)
      }
      
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // 認証状態のログ出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development' && !req.nextauth.token) {
      console.log(`🔓 公開アクセス: ${pathname}`)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // ミドルウェア関数でリダイレクト処理を行っているため、
        // ここでは常にtrueを返してミドルウェア関数を実行させる
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