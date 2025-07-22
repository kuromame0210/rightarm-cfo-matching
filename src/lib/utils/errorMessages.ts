/**
 * 認証エラーメッセージの日本語化マッピング
 */

export interface ErrorTranslation {
  [key: string]: string
}

// NextAuth.js / Supabase 認証エラーの日本語変換
export const authErrorMessages: ErrorTranslation = {
  // NextAuth.js標準エラー
  'CredentialsSignin': 'メールアドレスまたはパスワードが正しくありません',
  'EmailSignin': 'メールアドレスの送信に失敗しました',
  'OAuthSignin': 'OAuth認証に失敗しました',
  'OAuthCallback': 'OAuth認証のコールバックエラーが発生しました',
  'OAuthCreateAccount': 'OAuthアカウントの作成に失敗しました',
  'EmailCreateAccount': 'メールでのアカウント作成に失敗しました',
  'Callback': '認証コールバックエラーが発生しました',
  'OAuthAccountNotLinked': 'このメールアドレスは他の認証方式で登録されています',
  'EmailSignInError': 'メールサインインでエラーが発生しました',
  'CredentialsSignInError': '認証情報の確認でエラーが発生しました',
  'SessionRequired': 'この操作にはログインが必要です',
  
  // Supabase Auth エラー
  'invalid_credentials': 'メールアドレスまたはパスワードが正しくありません',
  'email_not_confirmed': 'メールアドレスの確認が完了していません。確認メールをご確認ください',
  'signup_disabled': 'ユーザー登録は現在無効になっています',
  'email_address_invalid': '有効なメールアドレスを入力してください',
  'password_too_short': 'パスワードは6文字以上で入力してください',
  'email_address_not_authorized': 'このメールアドレスでの登録は許可されていません',
  'user_not_found': 'ユーザーが見つかりません',
  'invalid_email': '有効なメールアドレスを入力してください',
  'weak_password': 'より強いパスワードを設定してください',
  'email_taken': 'このメールアドレスは既に使用されています',
  'too_many_requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
  'captcha_failed': 'CAPTCHA認証に失敗しました',
  'saml_provider_disabled': 'SAML認証は無効になっています',
  'email_change_token_invalid': 'メール変更トークンが無効です',
  'same_email': '現在と同じメールアドレスです',
  'over_email_send_rate_limit': 'メール送信の制限に達しました。しばらく待ってから再試行してください',
  'over_request_rate_limit': 'リクエストの制限に達しました。しばらく待ってから再試行してください',
  
  // ネットワークエラー
  'fetch_error': 'ネットワークエラーが発生しました。接続を確認してください',
  'timeout': '接続がタイムアウトしました。しばらくしてから再試行してください',
  'network_error': 'ネットワークに問題が発生しています',
  'server_error': 'サーバーエラーが発生しました。管理者にお問い合わせください',
  
  // バリデーションエラー
  'required_field': 'この項目は必須です',
  'invalid_format': '入力形式が正しくありません',
  'passwords_not_match': 'パスワードが一致しません',
  'email_invalid': '有効なメールアドレスを入力してください',
  
  // デフォルトエラー
  'unknown_error': '予期しないエラーが発生しました。しばらくしてから再試行してください',
  'default': 'エラーが発生しました。しばらくしてから再試行してください'
}

/**
 * エラーメッセージを日本語に変換
 * @param error エラーオブジェクトまたは文字列
 * @returns 日本語化されたエラーメッセージ
 */
export function translateError(error: any): string {
  if (!error) {
    return authErrorMessages.unknown_error
  }
  
  // 文字列の場合
  if (typeof error === 'string') {
    return authErrorMessages[error] || authErrorMessages.default
  }
  
  // エラーオブジェクトの場合
  let errorCode: string = ''
  
  // NextAuth.js エラー形式
  if (error.type) {
    errorCode = error.type
  }
  // Supabase エラー形式
  else if (error.code) {
    errorCode = error.code
  }
  // error.message から推測
  else if (error.message) {
    const message = error.message.toLowerCase()
    
    // 一般的なエラーメッセージから判定
    if (message.includes('credentials')) {
      errorCode = 'invalid_credentials'
    } else if (message.includes('email') && message.includes('invalid')) {
      errorCode = 'email_address_invalid'
    } else if (message.includes('network') || message.includes('fetch')) {
      errorCode = 'network_error'
    } else if (message.includes('timeout')) {
      errorCode = 'timeout'
    } else if (message.includes('rate limit')) {
      errorCode = 'too_many_requests'
    }
  }
  
  return authErrorMessages[errorCode] || authErrorMessages.default
}

/**
 * バリデーションエラー専用の変換関数
 */
export function translateValidationError(field: string, rule: string): string {
  const validationMessages: Record<string, Record<string, string>> = {
    email: {
      required: 'メールアドレスは必須です',
      invalid: '有効なメールアドレスを入力してください',
      taken: 'このメールアドレスは既に使用されています'
    },
    password: {
      required: 'パスワードは必須です',
      min: 'パスワードは8文字以上で入力してください',
      weak: 'より強いパスワードを設定してください',
      mismatch: 'パスワードが一致しません'
    },
    name: {
      required: '名前は必須です',
      max: '名前は100文字以内で入力してください'
    }
  }
  
  return validationMessages[field]?.[rule] || authErrorMessages.default
}