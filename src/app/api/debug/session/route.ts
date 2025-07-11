// セッション状態デバッグ用API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/index'

export async function GET(request: NextRequest) {
  console.log('🔍 Debug Session API: セッション確認開始')
  
  try {
    const session = await getServerSession(authOptions)
    
    const debugInfo = {
      hasSession: !!session,
      user: session?.user || null,
      expires: session?.expires || null,
      timestamp: new Date().toISOString()
    }
    
    console.log('🔍 Debug Session API: セッション情報', debugInfo)
    
    return NextResponse.json({
      success: true,
      data: debugInfo
    })
  } catch (error) {
    console.error('🚨 Debug Session API: エラー', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'セッション取得エラー',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}