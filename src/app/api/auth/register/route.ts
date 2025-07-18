import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// バリデーションスキーマ
const registerSchema = z.object({
  // 基本情報（必須）
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .max(254, 'メールアドレスが長すぎます'),
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(72, 'パスワードは72文字以内で入力してください')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'パスワードは英字と数字を含む必要があります'),
  userType: z.enum(['company', 'cfo'], { required_error: 'ユーザータイプを選択してください' }),
  displayName: z.string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .regex(/^[^\s].*[^\s]$|^[^\s]$/, '名前の前後に空白は入力できません'),

  // 企業固有情報（条件付き必須）
  companyName: z.string()
    .max(200, '会社名は200文字以内で入力してください')
    .optional(),
  businessName: z.string()
    .max(200, '事業名は200文字以内で入力してください')
    .optional(),
  description: z.string()
    .max(1000, '会社概要は1000文字以内で入力してください')
    .optional(),
  revenueRange: z.enum(['under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private'])
    .optional(),
  challengeTags: z.array(z.string())
    .max(10, '財務課題は10個まで選択できます')
    .optional(),
  financialChallengesDetail: z.string()
    .max(2000, '財務課題の詳細は2000文字以内で入力してください')
    .optional(),

  // CFO固有情報（全て任意）
  nickname: z.string()
    .max(50, 'ニックネームは50文字以内で入力してください')
    .optional(),
  skills: z.record(z.array(z.string()))
    .optional()
    .refine((skills) => {
      if (!skills) return true
      const totalSkills = Object.values(skills).flat().length
      return totalSkills <= 30
    }, 'スキルは30個まで選択できます'),
  experience: z.string()
    .max(5000, '経歴は5000文字以内で入力してください')
    .optional(),
  workPreference: z.enum(['weekly', 'monthly', 'project', 'flexible'])
    .optional(),
  compensationRange: z.string()
    .max(200, '希望報酬は200文字以内で入力してください')
    .optional(),
  
  // 新しいCFOフィールド
  location: z.string()
    .max(100, '居住地は100文字以内で入力してください')
    .optional(),
  workingHours: z.string()
    .max(200, '週の稼働可能時間は200文字以内で入力してください')
    .optional(),
  possibleTasks: z.string()
    .max(2000, '可能な業務は2000文字以内で入力してください')
    .optional(),
  certifications: z.string()
    .max(1000, '保有資格は1000文字以内で入力してください')
    .optional(),
  monthlyCompensation: z.string()
    .max(500, '想定月額報酬は500文字以内で入力してください')
    .optional(),
  workingArea: z.string()
    .max(500, '対応可能エリアは500文字以内で入力してください')
    .optional(),
  introduction: z.string()
    .max(2000, '紹介文は2000文字以内で入力してください')
    .optional(),

  // プロフィール画像（任意）
  profileImage: z.string()
    .optional()
    .refine((image) => {
      if (!image) return true
      return image.startsWith('data:image/') && image.includes('base64,')
    }, 'プロフィール画像の形式が正しくありません')
})

// プロフィール画像アップロード処理
async function handleProfileImageUpload(
  profileImageData: string | undefined, 
  userId: string, 
  userType: 'company' | 'cfo'
): Promise<string | null> {
  if (!profileImageData || !profileImageData.startsWith('data:')) {
    return null
  }

  try {
    console.log('📸 プロフィール画像アップロード開始')
    
    // Base64データをBlobに変換
    const base64Data = profileImageData.split(',')[1]
    const mimeType = profileImageData.split(':')[1].split(';')[0]
    const buffer = Buffer.from(base64Data, 'base64')
    
    // ファイル拡張子を取得
    const extension = mimeType.split('/')[1] || 'jpg'
    const fileName = `profile-${userType}-${Date.now()}.${extension}`
    
    // FormDataを作成
    const formData = new FormData()
    const blob = new Blob([buffer], { type: mimeType })
    const file = new File([blob], fileName, { type: mimeType })
    
    formData.append('file', file)
    formData.append('fileType', userType === 'company' ? 'COMPANY_LOGO' : 'PROFILE_IMAGE')
    formData.append('userId', userId)

    // 内部API呼び出し（同じサーバー内）
    const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload`, {
      method: 'POST',
      body: formData
    })

    if (!uploadResponse.ok) {
      throw new Error('アップロードAPIエラー')
    }

    const uploadResult = await uploadResponse.json()
    console.log('✅ プロフィール画像アップロード完了:', uploadResult.url)
    
    return uploadResult.url
  } catch (error) {
    console.error('❌ プロフィール画像アップロードエラー:', error)
    return null
  }
}

// 年商レンジをmin/maxに変換
function getRevenueRange(revenueRange: string): { min: number | null, max: number | null } {
  const ranges: Record<string, { min: number | null, max: number | null }> = {
    'under_100m': { min: 0, max: 100000000 },
    '100m_1b': { min: 100000000, max: 1000000000 },
    '1b_10b': { min: 1000000000, max: 10000000000 },
    '10b_30b': { min: 10000000000, max: 30000000000 },
    'over_50b': { min: 50000000000, max: null },
    'private': { min: null, max: null }
  }
  return ranges[revenueRange] || { min: null, max: null }
}

// ロールバック処理関数
async function rollbackUserCreation(userId: string, avatarUrl: string | null) {
  console.log('🔄 ロールバック開始:', userId)
  
  try {
    // 1. アップロードされた画像を削除
    if (avatarUrl) {
      try {
        // URLからファイルパスを抽出して削除
        const url = new URL(avatarUrl)
        const pathParts = url.pathname.split('/')
        const bucket = pathParts[pathParts.length - 2]
        const fileName = pathParts[pathParts.length - 1]
        
        if (bucket && fileName) {
          await supabaseAdmin.storage
            .from(bucket)
            .remove([`profiles/${fileName}`])
          console.log('✅ アップロード画像削除完了')
        }
      } catch (imageError) {
        console.error('⚠️ 画像削除エラー（継続）:', imageError)
      }
    }

    // 2. Supabase Authユーザーを削除
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('❌ ユーザー削除エラー:', deleteError)
    } else {
      console.log('✅ ユーザー削除完了')
    }
  } catch (error) {
    console.error('❌ ロールバック処理エラー:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 登録API: リクエスト受信')

    // リクエストボディの解析
    const body = await request.json()
    console.log('📋 登録データ:', {
      email: body.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
      userType: body.userType,
      hasPassword: !!body.password
    })

    // バリデーション
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      console.log('❌ バリデーションエラー:', validationResult.error.errors)
      return NextResponse.json({
        success: false,
        error: validationResult.error.errors[0]?.message || 'バリデーションエラーが発生しました'
      }, { status: 400 })
    }

    const data = validationResult.data

    // 企業の場合は会社名必須チェック
    if (data.userType === 'company' && !data.companyName) {
      return NextResponse.json({
        success: false,
        error: '会社名は必須です'
      }, { status: 400 })
    }

    // 重複チェック（未認証ユーザーは削除して再登録可能）
    console.log('🔍 詳細重複チェック開始')
    
    // 1. Supabase Authでのメール重複チェック
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingUsers.users.find(u => u.email?.toLowerCase() === data.email.toLowerCase())

    if (existingAuthUser) {
      // メール認証済みユーザーの場合は重複エラー
      if (existingAuthUser.email_confirmed_at) {
        console.log('❌ 認証済みユーザーの重複:', data.email?.replace(/(.{3}).*(@.*)/, '$1***$2'))
        return NextResponse.json({
          success: false,
          error: 'このメールアドレスは既に登録されています'
        }, { status: 409 })
      }
      
      // 未認証ユーザーの場合は削除して再登録を許可
      console.log('🔄 未認証ユーザーを削除して再登録:', data.email?.replace(/(.{3}).*(@.*)/, '$1***$2'))
      try {
        // 関連プロフィールデータも削除
        if (data.userType === 'company') {
          await supabaseAdmin.from(TABLES.BIZ_PROFILES).delete().eq('biz_user_id', existingAuthUser.id)
        } else {
          await supabaseAdmin.from(TABLES.CFO_PROFILES).delete().eq('cfo_user_id', existingAuthUser.id)
        }
        
        // Authユーザー削除
        await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id)
        console.log('✅ 未認証ユーザー削除完了')
      } catch (deleteError) {
        console.error('⚠️ 未認証ユーザー削除エラー:', deleteError)
        // エラーでも継続（新規作成を試行）
      }
    }

    // 2. 企業名重複チェック（企業登録の場合）
    if (data.userType === 'company' && data.companyName) {
      const { data: existingCompany } = await supabaseAdmin
        .from(TABLES.BIZ_PROFILES)
        .select('biz_company_name')
        .eq('biz_company_name', data.companyName)
        .limit(1)

      if (existingCompany && existingCompany.length > 0) {
        console.log('⚠️ 会社名重複:', data.companyName)
        // 会社名重複は警告のみ（同名会社が存在する可能性があるため）
      }
    }

    // Supabase Auth でユーザー作成
    console.log('👤 Supabase Authユーザー作成開始')
    const isDevelopment = process.env.NODE_ENV === 'development' || data.email.includes('@example.com')
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: isDevelopment // 開発環境またはテストメールは自動認証
    })

    if (authError || !authUser.user) {
      console.error('❌ ユーザー作成エラー:', authError)
      return NextResponse.json({
        success: false,
        error: 'ユーザー作成に失敗しました: ' + (authError?.message || '不明なエラー')
      }, { status: 500 })
    }

    console.log('✅ Supabase Authユーザー作成完了:', authUser.user.id)

    // プロフィール画像のアップロード処理
    let avatarUrl: string | null = null
    if (data.profileImage) {
      console.log('📸 プロフィール画像データ確認:', {
        hasData: !!data.profileImage,
        dataType: typeof data.profileImage,
        startsWithData: data.profileImage.startsWith('data:'),
        length: data.profileImage.length,
        preview: data.profileImage.substring(0, 50) + '...'
      })
      avatarUrl = await handleProfileImageUpload(data.profileImage, authUser.user.id, data.userType)
      console.log('📸 アップロード結果:', { avatarUrl })
    } else {
      console.log('📸 プロフィール画像なし')
    }

    // プロフィール作成
    if (data.userType === 'company') {
      console.log('🏢 企業プロフィール作成開始')
      const { min: revenueMin, max: revenueMax } = getRevenueRange(data.revenueRange || '')
      
      const { error: profileError } = await supabaseAdmin
        .from(TABLES.BIZ_PROFILES)
        .insert({
          biz_user_id: authUser.user.id,
          avatar_url: avatarUrl,
          biz_company_name: data.companyName,
          biz_location: '', // 今後実装
          biz_revenue_min: revenueMin,
          biz_revenue_max: revenueMax,
          biz_issues: data.challengeTags || [],
          biz_raw_profile: JSON.stringify({
            businessName: data.businessName,
            description: data.description,
            displayName: data.displayName,
            revenueRange: data.revenueRange,
            financialChallengesDetail: data.financialChallengesDetail
          })
        })

      if (profileError) {
        console.error('❌ 企業プロフィール作成エラー:', profileError)
        // 完全ロールバック処理
        await rollbackUserCreation(authUser.user.id, avatarUrl)
        return NextResponse.json({
          success: false,
          error: '企業プロフィール作成に失敗しました: ' + (profileError.message || '不明なエラー')
        }, { status: 500 })
      }

      console.log('✅ 企業プロフィール作成完了')

    } else if (data.userType === 'cfo') {
      console.log('👤 CFOプロフィール作成開始')
      
      const { error: profileError } = await supabaseAdmin
        .from(TABLES.CFO_PROFILES)
        .insert({
          cfo_user_id: authUser.user.id,
          avatar_url: avatarUrl,
          cfo_name: data.displayName,
          cfo_display_name: data.nickname || data.displayName,
          cfo_location: data.location || '',
          cfo_availability: data.workingHours || data.workPreference || '',
          cfo_fee_min: null, // 今後実装
          cfo_fee_max: null, // 今後実装
          cfo_skills: data.skills ? Object.values(data.skills).flat() : [],
          // 新しいカラム構造に直接保存
          cfo_compensation: data.monthlyCompensation || '',
          cfo_possible_tasks: data.possibleTasks || '',
          cfo_certifications: data.certifications || '',
          cfo_working_areas: data.workingArea || '',
          cfo_introduction: data.introduction || '',
          // Raw Profileは経歴のみに簡素化
          cfo_raw_profile: data.experience || ''
        })

      if (profileError) {
        console.error('❌ CFOプロフィール作成エラー:', profileError)
        // 完全ロールバック処理
        await rollbackUserCreation(authUser.user.id, avatarUrl)
        return NextResponse.json({
          success: false,
          error: 'CFOプロフィール作成に失敗しました: ' + (profileError.message || '不明なエラー')
        }, { status: 500 })
      }

      console.log('✅ CFOプロフィール作成完了')
    }

    // 成功レスポンス
    console.log('🎉 登録完了:', {
      userId: authUser.user.id,
      userType: data.userType,
      email: data.email?.replace(/(.{3}).*(@.*)/, '$1***$2')
    })

    const message = isDevelopment 
      ? '登録が完了しました。開発環境のため、メール認証をスキップしました。すぐにログインできます。'
      : '登録が完了しました。メールアドレスに送信された認証リンクをクリックして、アカウントを有効化してください。'

    return NextResponse.json({
      success: true,
      message,
      data: {
        userId: authUser.user.id,
        email: authUser.user.email,
        userType: data.userType,
        emailVerificationRequired: !isDevelopment
      }
    })

  } catch (error) {
    console.error('❌ 登録API エラー:', error)
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}