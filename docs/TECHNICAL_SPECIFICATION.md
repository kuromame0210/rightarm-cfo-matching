# Rextrix v3 技術仕様書

## 🏗️ アーキテクチャ概要

### **フロントエンド**
- **フレームワーク**: Next.js 15.3.4 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI状態管理**: React useState/useEffect
- **デプロイ**: Vercel

### **バックエンド**
- **API**: Next.js API Routes
- **認証**: 実装予定（JWT/NextAuth.js）
- **データベース**: 実装予定（Supabase/PostgreSQL）

## 🔧 外部サービス統合

### **1. 面談機能**
```javascript
// Zoom API統合
const meetingIntegration = {
  service: 'Zoom API',
  purpose: '面談リンク自動生成',
  endpoint: 'https://api.zoom.us/v2/users/me/meetings',
  authentication: 'JWT Token',
  features: [
    '面談リンク自動生成',
    'ミーティングID発行',
    'パスコード設定'
  ]
}
```

### **2. カレンダー連携**
```javascript
const calendarIntegration = {
  services: ['Google Calendar API', 'Outlook API'],
  purpose: '面談予定の自動追加',
  features: [
    'カレンダーイベント作成',
    '参加者招待',
    'リマインダー設定'
  ]
}
```

### **3. 定期処理（Cron）**
```yaml
# .github/workflows/cron-reminders.yml
name: Meeting Reminders
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日 9:00 JST
  workflow_dispatch:

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Meeting Reminders
        run: |
          curl -X POST https://rightarm-v3.vercel.app/api/cron/reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### **4. ファイルストレージ**
```javascript
// Vercel Blob Storage
import { put } from '@vercel/blob';

export async function uploadInvoiceDocument(file: File) {
  const blob = await put(`invoices/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  
  return blob.url;
}
```

### **5. メール送信**
```javascript
// Resend統合
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  provider: 'Resend',
  freeLimit: '3,000通/月',
  
  async sendContractNotification(userEmail: string, contractData: any) {
    return await resend.emails.send({
      from: 'RightArm <noreply@rightarm.com>',
      to: [userEmail],
      subject: '【RightArm】契約開始のお知らせ',
      html: `
        <h2>契約が開始されました</h2>
        <p>契約ID: ${contractData.id}</p>
        <p>開始日: ${contractData.startDate}</p>
        <p>期間: ${contractData.duration}</p>
      `
    });
  }
}
```

## 💰 支払い・契約管理フロー

### **データフロー**
```
1. 面談完了 → 契約成立
2. 請求書自動生成 (顧問料 + 手数料5%)
3. 企業が振込実行
4. 証憑アップロード (Vercel Blob Storage)
5. 支払い報告ボタン
6. 管理者が管理画面で入金確認 (手動)
7. ステータス更新 → Resendで自動通知送信
8. 契約開始
```

### **振込先情報管理**
```javascript
// ENV変数での管理
const bankInfo = {
  bankName: process.env.BANK_NAME || '三井住友銀行',
  branchName: process.env.BANK_BRANCH || '渋谷支店',
  accountType: process.env.BANK_ACCOUNT_TYPE || '普通',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567',
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'RightArm株式会社'
};
```

### **管理者操作**
```javascript
// 管理画面での入金確認処理
export async function verifyPayment(invoiceId: string, adminId: string) {
  // 1. ステータス更新 (手動トリガー)
  await updateInvoiceStatus(invoiceId, 'verified', adminId);
  
  // 2. 自動通知送信
  await Promise.all([
    sendNotificationToCompany(invoiceId),
    sendNotificationToCFO(invoiceId)
  ]);
  
  return { success: true, status: 'verified' };
}
```

## 🔐 セキュリティ設定

### **環境変数**
```bash
# .env.local
ZOOM_JWT_TOKEN=eyJhbGciOiJIUzI1NiJ9...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
GOOGLE_CALENDAR_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com
CRON_SECRET=your-secret-token
BANK_NAME=三井住友銀行
BANK_BRANCH=渋谷支店
BANK_ACCOUNT_NUMBER=1234567
BANK_ACCOUNT_HOLDER=RightArm株式会社
```

### **APIセキュリティ**
```javascript
// API認証チェック
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cron認証
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 処理実行
}
```

## 📊 パフォーマンス・制限

### **サービス制限**
| サービス | 無料枠 | 有料プラン |
|---------|-------|-----------|
| **Vercel** | 100GB帯域/月 | Pro $20/月 |
| **Resend** | 3,000通/月 | Pro $20/月 |
| **Zoom API** | 従量課金 | Basic無料 |
| **GitHub Actions** | 2,000分/月 | 無制限 |

### **想定トラフィック**
```javascript
const estimatedUsage = {
  users: '1,000人/月',
  meetings: '200件/月', 
  contracts: '50件/月',
  emails: '500通/月',
  fileUploads: '100MB/月'
};
```

## 🚀 デプロイ・運用

### **本番環境**
- **ホスティング**: Vercel
- **ドメイン**: rightarm.com (予定)
- **SSL**: 自動 (Vercel)
- **CDN**: Vercel Edge Network

### **監視・ログ**
```javascript
// エラー追跡
const monitoring = {
  errors: 'Vercel Analytics',
  performance: 'Web Vitals',
  uptime: 'Vercel Status',
  logs: 'Vercel Function Logs'
};
```

## 📈 スケーラビリティ

### **成長対応**
```javascript
// 段階的移行計画
const scalingPlan = {
  MVP: 'すべてVercel + 外部API',
  Growth: 'DB追加 (Supabase)',
  Scale: 'マイクロサービス化',
  Enterprise: 'AWS/GCP移行検討'
};
```

---

## 🔄 実装ステータス

### **完了済み**
- ✅ Next.js基盤構築
- ✅ UI/UXデザイン実装
- ✅ 基本ページ構成
- ✅ モックデータ統合

### **実装予定**
- 🚧 Zoom API統合
- 🚧 Resend設定
- 🚧 Vercel Blob Storage
- 🚧 GitHub Actions Cron
- 🚧 データベース設計

---

**最終更新**: 2024年6月23日  
**バージョン**: v3.0.0