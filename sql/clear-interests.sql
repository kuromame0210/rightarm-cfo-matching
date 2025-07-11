-- 気になるリストをクリアするSQL
-- Supabase SQL Editor で実行してください

-- 1. 現在の気になるリストを確認
SELECT * FROM rextrix_interests;

-- 2. 気になるリストを全てクリア
DELETE FROM rextrix_interests;

-- 3. クリア後の確認
SELECT COUNT(*) as remaining_interests FROM rextrix_interests;

-- 実行結果
SELECT 'Interests cleared successfully' as result;