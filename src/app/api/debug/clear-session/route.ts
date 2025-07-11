// セッションクリア用デバッグAPI
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🧹 Debug: セッションクリア実行')
  
  try {
    const cookieStore = await cookies()
    
    // NextAuth.jsのセッションクッキーを削除
    const sessionCookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ]
    
    sessionCookies.forEach(cookieName => {
      cookieStore.delete(cookieName)
    })
    
    console.log('🧹 Debug: セッションクリア完了')
    
    return NextResponse.json({
      success: true,
      message: 'セッションをクリアしました'
    })
  } catch (error) {
    console.error('🚨 Debug: セッションクリアエラー', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'セッションクリアエラー',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}