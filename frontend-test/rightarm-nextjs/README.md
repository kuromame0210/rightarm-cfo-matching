# RightArm - Next.js Version

企業とCFOのマッチングサイトのNext.js版です。

## 特徴

- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 🎭 Framer Motion (アニメーション)
- 📱 完全レスポンシブデザイン
- ⚡ TypeScript

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーは [http://localhost:3000](http://localhost:3000) で起動します。

## デザインの改善点

### 従来版からの向上点:
1. **モダンなアニメーション**: Framer Motionによる滑らかなアニメーション
2. **レスポンシブ改善**: Tailwind CSSによるより洗練されたレスポンシブデザイン
3. **パフォーマンス**: Next.jsによる最適化
4. **コンポーネント化**: 再利用可能なコンポーネント構造
5. **TypeScript**: 型安全性の向上

### スタイリッシュな要素:
- グラデーション背景とフローティングアニメーション
- ボタンホバー時のシマーエフェクト
- カードのホバーアニメーション
- ステガードアニメーション
- ミニマルでエレガントなデザイン

## ファイル構成

```
rightarm-nextjs/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   └── Footer.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```