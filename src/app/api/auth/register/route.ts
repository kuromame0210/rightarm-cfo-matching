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

  // 🆕 CFO構造化必須項目（EssentialProfileInputs準拠）
  compensationType: z.enum(['monthly', 'negotiable'])
    .optional(), // 必須だが、条件付きバリデーションで処理
  monthlyFeeMin: z.number()
    .min(50000, '月額下限は5万円以上で設定してください')
    .max(2500000, '月額下限は250万円以下で設定してください')
    .optional(),
  monthlyFeeMax: z.number()
    .min(50000, '月額上限は5万円以上で設定してください')
    .max(2500000, '月額上限は250万円以下で設定してください')
    .optional(),
  weeklyDays: z.number()
    .min(1, '週稼働日数は1日以上で設定してください')
    .max(5, '週稼働日数は5日以下で設定してください')
    .optional(), // 必須だが、条件付きバリデーションで処理
  weeklyDaysFlexible: z.boolean()
    .optional(),
  supportedPrefectures: z.array(z.enum(['kanto', 'kansai', 'chubu', 'tohoku', 'kyushu', 'nationwide']))
    .optional(), // 必須だが、条件付きバリデーションで処理
  fullRemoteAvailable: z.boolean()
    .optional(),

  // CFO詳細情報（全て任意）
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
  
  // レガシーCFOフィールド（任意）
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
    console.log('📧 [EMAIL_DEBUG] API: リクエスト受信')
    console.log('📧 [EMAIL_DEBUG] 環境変数確認:', {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_URL_DOMAIN: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1],
      SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SERVICE_ROLE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // Supabase Auth 関連設定の確認
      SUPABASE_AUTH_EXTERNAL_EMAIL: process.env.SUPABASE_AUTH_EXTERNAL_EMAIL_ENABLED,
      SMTP_CONFIG: {
        hasHost: !!process.env.SMTP_HOST,
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
        hasPort: !!process.env.SMTP_PORT
      }
    })

    // リクエストボディの解析
    const body = await request.json()
    console.log('📧 [EMAIL_DEBUG] 登録データ:', {
      email: body.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
      userType: body.userType,
      hasPassword: !!body.password,
      ...(body.userType === 'cfo' && {
        cfoStructuredFields: {
          compensationType: body.compensationType,
          monthlyFeeMin: body.monthlyFeeMin,
          monthlyFeeMax: body.monthlyFeeMax,
          weeklyDays: body.weeklyDays,
          supportedPrefectures: body.supportedPrefectures?.length || 0,
          fullRemoteAvailable: body.fullRemoteAvailable
        }
      })
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

    // CFOの場合は構造化必須項目チェック
    if (data.userType === 'cfo') {
      if (!data.compensationType) {
        return NextResponse.json({
          success: false,
          error: '報酬体系（月額制・応相談）の選択は必須です'
        }, { status: 400 })
      }
      
      if (!data.weeklyDays) {
        return NextResponse.json({
          success: false,
          error: '週稼働日数の選択は必須です'
        }, { status: 400 })
      }
      
      if (!data.supportedPrefectures || data.supportedPrefectures.length === 0) {
        return NextResponse.json({
          success: false,
          error: '対応エリアの選択は必須です'
        }, { status: 400 })
      }
      
      // 月額制の場合は料金設定チェック
      if (data.compensationType === 'monthly') {
        if (!data.monthlyFeeMin) {
          return NextResponse.json({
            success: false,
            error: '月額制の場合、料金下限の設定は必須です'
          }, { status: 400 })
        }
        
        if (data.monthlyFeeMax && data.monthlyFeeMax < data.monthlyFeeMin) {
          return NextResponse.json({
            success: false,
            error: '月額料金の上限は下限以上で設定してください'
          }, { status: 400 })
        }
      }
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
    console.log('📧 [EMAIL_DEBUG] Supabase Authユーザー作成開始')
    const isDevelopment = process.env.NODE_ENV === 'development' || data.email.includes('@example.com')
    
    console.log('📧 [EMAIL_DEBUG] メール送信設定:', {
      isDevelopment,
      email_confirm: isDevelopment,
      emailDomain: data.email.split('@')[1],
      willSkipEmailConfirmation: isDevelopment,
      actualEmailConfirmValue: isDevelopment
    })
    
    console.log('📧 [EMAIL_DEBUG] Supabase createUser 実行前:', {
      willSendConfirmationEmail: !isDevelopment,
      expectedBehavior: isDevelopment ? 'auto-confirm' : 'send-email'
    })
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: isDevelopment, // 開発環境またはテストメールは自動認証
      user_metadata: {
        name: data.displayName,
        role: data.userType, // userTypeをメタデータに保存
        email_verified: isDevelopment
      }
    })
    
    console.log('📧 [EMAIL_DEBUG] Supabase createUser 実行完了:', {
      success: !authError,
      userCreated: !!authUser?.user,
      emailConfirmedAtCreation: authUser?.user?.email_confirmed_at,
      emailConfirmationSent: authUser?.user && !authUser.user.email_confirmed_at,
      rawUserObject: {
        id: authUser?.user?.id,
        email: authUser?.user?.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
        created_at: authUser?.user?.created_at,
        email_confirmed_at: authUser?.user?.email_confirmed_at,
        confirmation_sent_at: authUser?.user?.confirmation_sent_at
      }
    })

    // 🚨 Admin API では確認メールが自動送信されない場合があるため手動送信
    const emailSendingResult: { 
      attempted: boolean; 
      success: boolean; 
      error: any; 
    } = { attempted: false, success: false, error: null }
    
    if (!isDevelopment && authUser?.user && !authUser.user.email_confirmed_at) {
      emailSendingResult.attempted = true
      console.log('📧 [EMAIL_DEBUG] 手動確認メール送信開始')
      console.log('📧 [EMAIL_DEBUG] 送信パラメータ:', {
        type: 'signup',
        email: data.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
        redirectTo: 'https://www.rextrix.jp/auth/login?message=confirmed'
      })
      
      try {
        const { error: resendError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: data.email,
          password: data.password,
          options: {
            redirectTo: `https://www.rextrix.jp/auth/login?message=confirmed`
          }
        })

        if (resendError) {
          console.error('📧 [EMAIL_DEBUG] 確認メール送信エラー:', resendError)
          emailSendingResult.error = {
            message: resendError.message,
            code: resendError.code || 'unknown',
            details: resendError
          }
        } else {
          console.log('📧 [EMAIL_DEBUG] 確認メール送信成功')
          emailSendingResult.success = true
          
          // 送信後のユーザー状況を再確認
          const { data: afterEmailUser } = await supabaseAdmin.auth.admin.getUserById(authUser.user.id)
          console.log('📧 [EMAIL_DEBUG] 手動送信後のユーザー状況:', {
            confirmation_sent_at: afterEmailUser?.user?.confirmation_sent_at,
            updated_at: afterEmailUser?.user?.updated_at
          })
        }
      } catch (manualSendError) {
        console.error('📧 [EMAIL_DEBUG] 手動メール送信処理エラー:', manualSendError)
        emailSendingResult.error = {
          message: (manualSendError as Error)?.message || 'Unknown error',
          type: 'exception',
          details: manualSendError
        }
      }
    }

    if (authError || !authUser.user) {
      console.error('📧 [EMAIL_DEBUG] ユーザー作成エラー:', {
        error: authError,
        errorMessage: authError?.message,
        errorCode: authError?.status,
        hasUser: !!authUser?.user
      })
      return NextResponse.json({
        success: false,
        error: 'ユーザー作成に失敗しました: ' + (authError?.message || '不明なエラー')
      }, { status: 500 })
    }

    console.log('📧 [EMAIL_DEBUG] Supabase Authユーザー作成完了:', {
      userId: authUser.user.id,
      email: authUser.user.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
      emailConfirmed: authUser.user.email_confirmed_at,
      createdAt: authUser.user.created_at,
      userMetadata: authUser.user.user_metadata
    })

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
          // 🆕 構造化必須項目を正しいカラムに保存
          compensation_type: data.compensationType,
          monthly_fee_min: data.monthlyFeeMin,
          monthly_fee_max: data.monthlyFeeMax || data.monthlyFeeMin, // 上限未設定時は下限と同じ
          weekly_days: data.weeklyDays,
          weekly_days_flexible: data.weeklyDaysFlexible || false,
          supported_prefectures: data.supportedPrefectures || [],
          full_remote_available: data.fullRemoteAvailable || false,
          // レガシーカラム（互換性維持）
          cfo_fee_min: data.monthlyFeeMin,
          cfo_fee_max: data.monthlyFeeMax || data.monthlyFeeMin,
          cfo_skills: data.skills ? Object.values(data.skills).flat() : [],
          // 詳細情報（任意）
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
    // 📧 Supabaseでのメール送信状況を最終確認
    console.log('📧 [EMAIL_DEBUG] 最終メール送信状況確認:')
    try {
      const { data: finalUser } = await supabaseAdmin.auth.admin.getUserById(authUser.user.id)
      console.log('📧 [EMAIL_DEBUG] 作成直後のユーザー状況:', {
        userId: finalUser?.user?.id,
        email: finalUser?.user?.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
        email_confirmed_at: finalUser?.user?.email_confirmed_at,
        created_at: finalUser?.user?.created_at,
        last_sign_in_at: finalUser?.user?.last_sign_in_at
      })
      
      // 📧 Supabase Auth設定の推測
      const wasEmailSent = !finalUser?.user?.email_confirmed_at && !isDevelopment
      console.log('📧 [EMAIL_DEBUG] メール送信判定:', {
        shouldHaveSentEmail: wasEmailSent,
        reasoning: wasEmailSent 
          ? 'email_confirmed_at is null and not development mode' 
          : isDevelopment 
            ? 'development mode - auto confirmed' 
            : 'email already confirmed or error'
      })
      
    } catch (userCheckError) {
      console.error('📧 [EMAIL_DEBUG] ユーザー状況確認エラー:', userCheckError)
    }

    console.log('📧 [EMAIL_DEBUG] 登録完了 - 最終結果:', {
      userId: authUser.user.id,
      userType: data.userType,
      email: data.email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
      isDevelopment,
      emailConfirmed: authUser.user.email_confirmed_at,
      willRequireEmailVerification: !isDevelopment,
      expectedMailDelivery: !isDevelopment ? 'should-be-sent' : 'skipped-dev-mode'
    })

    const message = isDevelopment 
      ? '登録が完了しました。開発環境のため、メール認証をスキップしました。すぐにログインできます。'
      : '登録が完了しました。メールアドレスに送信された認証リンクをクリックして、アカウントを有効化してください。'

    console.log('📧 [EMAIL_DEBUG] レスポンス送信:', {
      success: true,
      messagePreview: message.substring(0, 50) + '...',
      emailVerificationRequired: !isDevelopment,
      hasSession: !isDevelopment ? false : 'auto-login'
    })

    return NextResponse.json({
      success: true,
      message,
      data: {
        userId: authUser.user.id,
        email: authUser.user.email,
        userType: data.userType,
        emailVerificationRequired: !isDevelopment,
        ...(isDevelopment && {
          user: authUser.user
        })
      },
      // 🚨 一時的にサーバー情報をクライアントに送信（デバッグ用）
      debug: {
        serverLogs: 'Check Vercel Function Logs for detailed email sending info',
        manualEmailAttempted: !isDevelopment && !authUser.user.email_confirmed_at,
        timestamp: new Date().toISOString(),
        environment: {
          isDevelopment,
          NODE_ENV: process.env.NODE_ENV,
          hasSMTP: {
            host: !!process.env.SMTP_HOST,
            user: !!process.env.SMTP_USER,
            pass: !!process.env.SMTP_PASS
          }
        },
        supabaseUser: {
          id: authUser.user.id,
          email_confirmed_at: authUser.user.email_confirmed_at,
          created_at: authUser.user.created_at
        },
        // 🔥 メール送信の詳細結果
        emailSending: emailSendingResult
      }
    })

  } catch (error) {
    console.error('📧 [EMAIL_DEBUG] 登録API エラー (catch):', {
      error,
      errorName: (error as Error)?.name,
      errorMessage: (error as Error)?.message,
      errorStack: (error as Error)?.stack
    })
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}