# RightArm - CFOマッチングプラットフォーム

全国の中小企業に、"経営の右腕"を届けるマッチングプラットフォーム

## サービス概要

- **サービス名:** RightArm
- **事業内容:** 全国・小中堅企業×CFOのマッチングサイト
- **ミッション:** 全国の中小企業に、"経営の右腕"を届ける
- **ビジョン:** 全ての企業に"最適な経営パートナー"が当たり前にいる世界を。
- **ポジショニング:** 「経営に自由な出会いを」

## プロジェクト構成

```
├── blueprint/           # 設計・仕様書フォルダ（全設計資料）
│   ├── firebase-config.js       # Firebase認証設定
│   ├── supabase-config.js       # Supabaseデータベース設定
│   ├── auth.html                # ログイン・会員登録画面
│   ├── profile-manager.js       # プロフィール管理システム
│   ├── SETUP_GUIDE.md          # 認証システムセットアップ手順
│   ├── UI_DESIGN_REQUIREMENTS.md # UI/UX詳細要件書
│   ├── index.html              # デザインガイド（RIGHTARM仕様書）
│   ├── script.js               # デザインガイド用スクリプト
│   ├── styles.css              # デザインガイド用スタイル
│   ├── api/                    # API設計
│   └── md/                     # 設計文書
│       ├── blueprint_v3.md      # サービス仕様設計書
│       ├── persona.md           # ユーザーペルソナ定義
│       ├── readme.md            # 要件定義書
│       ├── youbou.md           # UI/UX詳細要求書
│       └── siteread.md         # サイト概要
└── implementation/      # 実装フォルダ（今後開発）
```

## フォルダ説明

### blueprint/
すべての設計・仕様書が含まれています：

**包括的仕様書**
- **index.html**: RightArm完全仕様設計書（インタラクティブガイド）
  - 1-8: 従来の設計手順
  - 9: 認証システム設計（Firebase + Supabase）
  - 10: UI/UX詳細設計（クラウドワークス参考）
- **script.js / styles.css**: デザインガイド用ファイル

**技術実装ファイル**
- **firebase-config.js**: Firebase認証設定
- **supabase-config.js**: Supabaseデータベース設定
- **supabase-schema.sql**: データベーススキーマ
- **auth.html**: ログイン・会員登録画面のUI
- **profile-manager.js**: プロフィール管理システム

**設計文書（md/）**
- **blueprint_v3.md**: サービス仕様設計書
- **persona.md**: ユーザーペルソナ定義
- **readme.md**: 要件定義書
- **youbou.md**: UI/UX詳細要求書（クラウドワークス参考）
- **youbou_v2.md**: 最新正式仕様書（CEO要件）
- **siteread.md**: サイト概要

### implementation/
実際の開発実装時に使用するフォルダ（今後作成予定）

## 開発フロー

1. **設計段階**: `blueprint/` フォルダで仕様を確定 ✅ 完了
2. **実装段階**: `implementation/` フォルダで実際の開発
3. **ドキュメント**: `md/` フォルダで設計文書を管理

### 実装優先度
1. **最優先**: UI/UX実装（クラウドワークス参考デザイン）
2. **二次実装**: 認証システム・基本機能
3. **後回し**: PWA対応・決済機能・管理機能

## 技術スタック（確定）

- **認証**: Firebase Authentication (メール/パスワード + Google OAuth)
- **データベース**: Supabase (PostgreSQL + Row Level Security)
- **フロントエンド**: Next.js / React
- **バックエンド**: Next.js API Routes
- **決済**: Stripe (Connect対応)
- **通知**: SendGrid または SES、Firebase Cloud Messaging
- **モバイル**: レスポンシブデザイン + PWA対応
- **デプロイ**: Vercel (Next.js最適化)

### 認証アーキテクチャ
**Firebase認証 + Supabaseデータベース連携**
- Firebase: Google OAuth、セキュリティ管理
- Supabase: データ管理、リアルタイム機能
- 連携: Firebase IDトークン → Next.js API → Supabase

## セットアップ

設計ファイルを確認する場合は `blueprint/SETUP_GUIDE.md` を参照してください。

## バージョン管理

このプロジェクトはGitで管理されています。設計段階と実装段階を分離して効率的な開発を進めます。