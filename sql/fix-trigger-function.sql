-- Supabase Auth Trigger関数修正スクリプト
-- Supabase SQL Editorで実行してください

-- 1. 既存のトリガーと関数を削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. 修正版のhandle_new_user関数を作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 新規ユーザー作成時に rextrix_users レコードを作成
  INSERT INTO public.rextrix_users (
    supabase_auth_id,
    email,
    user_type,
    status,
    email_verified,
    auth_provider,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'company'),
    'active',
    NEW.email_confirmed_at IS NOT NULL,
    'supabase',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生してもAuth処理は続行
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. トリガーを再作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. 確認メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Supabase Auth Trigger修正完了 ===';
  RAISE NOTICE 'handle_new_user関数とトリガーを再作成しました';
  RAISE NOTICE '新規ユーザー登録時に自動的にrextrix_usersレコードが作成されます';
END $$;