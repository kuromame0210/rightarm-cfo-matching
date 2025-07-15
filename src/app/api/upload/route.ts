import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateFile, generateFilePath, FILE_CONFIGS, type FileType } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 ファイルアップロードAPI開始')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as FileType
    const userId = formData.get('userId') as string

    console.log('📋 アップロードパラメータ:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType,
      userId: userId?.substring(0, 8) + '...'
    })

    if (!file || !fileType || !userId) {
      console.error('❌ 必須パラメータ不足')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const config = FILE_CONFIGS[fileType]
    const filePath = generateFilePath(userId, fileType, file.name)

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()

    // Upload using admin client on server side
    const { data, error } = await supabaseAdmin.storage
      .from(config.bucket)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('❌ ストレージアップロードエラー:', error)
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      )
    }

    console.log('✅ ストレージアップロード成功:', { path: data.path })

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(config.bucket)
      .getPublicUrl(filePath)

    console.log('🔗 公開URL生成:', { url: urlData.publicUrl })

    return NextResponse.json({
      success: true,
      data: data,
      url: urlData.publicUrl
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}