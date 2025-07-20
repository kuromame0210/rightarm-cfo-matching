#!/usr/bin/env node

// 企業一覧APIでのJSON文字列表示問題の修正案
console.log(`
🔍 企業一覧APIレスポンスと表示データ構造の調査結果

=== 問題の特定 ===

1. データベース構造の課題:
   - biz_profilesテーブルのbiz_raw_profileフィールドに2つの形式のデータが混在
   - プレーンテキスト: 既存データ（株式会社テストテック、株式会社北斗精密）
   - JSON文字列: 新しく追加されたデータ（グリーングロース合同会社など）

2. JSON文字列の内容:
   - businessName: 会社名
   - displayName: 表示用会社名  
   - description: 実際の企業説明文
   - revenueRange: 年商範囲
   - financialChallengesDetail: 財務課題詳細

3. 現在の問題:
   - JSON文字列がそのまま画面に表示される
   - ユーザーにとって読みにくい表示
   - データの不整合

=== 修正方針 ===

1. APIレスポンス側での修正（推奨）:
   - /api/companies/route.ts でJSON文字列を適切に解析
   - 統一されたフォーマットでフロントエンドに返す

2. フロントエンド側での修正（補完的）:
   - formatCompanyData関数でJSON文字列を検出・解析
   - 後方互換性を保ちながら表示改善

=== 具体的な修正内容 ===

APIレスポンス修正（companies/route.ts）:
- biz_raw_profileがJSON文字列の場合は解析
- descriptionフィールドから実際の説明文を抽出
- 統一されたデータ構造でレスポンス

データ統一化:
- JSON形式のデータからdescriptionを抽出
- プレーンテキストはそのまま使用
- 年商データの正規化

=== 修正実装 ===

以下のファイルを修正します:
1. /src/app/api/companies/route.ts - APIレスポンス改善
2. データベースの統一化スクリプト（必要に応じて）

`)

module.exports = {}