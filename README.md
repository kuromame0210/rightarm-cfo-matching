# RIGHTARM - CFOマッチングプラットフォーム

全国の企業に、"右腕CFO"を届けるマッチングプラットフォーム

## プロジェクト構成

```
├── blueprint/           # 設計・仕様書フォルダ
│   ├── firebase-config.js
│   ├── supabase-config.js
│   ├── auth.html
│   ├── profile-manager.js
│   ├── SETUP_GUIDE.md
│   └── api/
├── implementation/      # 実装フォルダ（今後開発）
├── md/                 # 既存のマークダウン文書
│   ├── blueprint_v3.md
│   ├── persona.md
│   └── readme.md
├── index.html          # デザインガイド（既存）
├── script.js           # デザインガイド用スクリプト
└── styles.css          # デザインガイド用スタイル
```

## フォルダ説明

### blueprint/
Firebase認証とSupabase連携の設計ファイルが含まれています：
- **firebase-config.js**: Firebase認証設定
- **supabase-config.js**: Supabaseデータベース設定
- **supabase-schema.sql**: データベーススキーマ
- **auth.html**: ログイン・会員登録画面のUI
- **profile-manager.js**: プロフィール管理システム
- **SETUP_GUIDE.md**: セットアップ手順書
- **package.json**: 必要な依存関係

### implementation/
実際の開発実装時に使用するフォルダ（今後作成予定）

### md/
プロジェクトの設計文書：
- **blueprint_v3.md**: サービス仕様設計書
- **persona.md**: ユーザーペルソナ定義
- **readme.md**: 要件定義書

## 開発フロー

1. **設計段階**: `blueprint/` フォルダで仕様を確定
2. **実装段階**: `implementation/` フォルダで実際の開発
3. **ドキュメント**: `md/` フォルダで設計文書を管理

## 技術スタック（予定）

- **認証**: Firebase Authentication
- **データベース**: Supabase (PostgreSQL)
- **フロントエンド**: Next.js / React
- **バックエンド**: Next.js API Routes
- **デプロイ**: Vercel (無料プラン対応)

## セットアップ

設計ファイルを確認する場合は `blueprint/SETUP_GUIDE.md` を参照してください。

## バージョン管理

このプロジェクトはGitで管理されています。設計段階と実装段階を分離して効率的な開発を進めます。