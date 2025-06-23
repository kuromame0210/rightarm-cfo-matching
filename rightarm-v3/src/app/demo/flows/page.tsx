'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function DemoFlowsPage() {
  const [selectedFlow, setSelectedFlow] = useState<'meeting' | 'payment'>('meeting')
  const [currentStep, setCurrentStep] = useState(1)

  // 面談リンク発行フロー
  const meetingFlow = [
    {
      step: 1,
      title: 'メッセージ画面で面談提案',
      description: 'メッセージエリアで「面談設定」ボタンをクリック',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-4">
            <div className="border-b pb-3 mb-4">
              <h3 className="font-medium">山田 太郎（CFO）</h3>
              <span className="text-sm text-green-600">● オンライン</span>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm">ご提案いただいた内容について、詳しくお話しできればと思います。</p>
                <span className="text-xs text-gray-500">14:30</span>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-lg ml-8">
                <p className="text-sm">ありがとうございます。来週はいかがでしょうか？</p>
                <span className="text-xs text-blue-200">14:32</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                  📅 面談設定
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  💼 契約条件確認
                </button>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      step: 2,
      title: '面談詳細の入力',
      description: '日時・形式・アジェンダを入力',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">面談設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">面談日時</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="border rounded px-3 py-2 text-sm" defaultValue="2024-02-15" />
                  <input type="time" className="border rounded px-3 py-2 text-sm" defaultValue="14:00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">面談形式</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="format" defaultChecked className="mr-2" />
                    <span className="text-sm">オンライン</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="format" className="mr-2" />
                    <span className="text-sm">対面</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">アジェンダ</label>
                <textarea className="w-full border rounded px-3 py-2 text-sm h-20" defaultValue="・事業概要の説明&#10;・財務課題のヒアリング&#10;・提案内容の詳細説明&#10;・今後のスケジュール確認"></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded text-sm">キャンセル</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">面談を提案</button>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      step: 3,
      title: '相手の承諾待ち',
      description: '提案相手に通知が送信され、承諾待ち状態',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-4">
            <div className="text-center py-6">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="font-medium text-gray-900 mb-2">面談提案を送信しました</h3>
              <p className="text-sm text-gray-600">
                山田 太郎さんの承諾をお待ちください
              </p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  📧 通知メールを送信済み<br />
                  💬 メッセージでも確認可能
                </p>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      step: 4,
      title: '面談リンク自動生成',
      description: '承諾後、ZoomリンクやGoogle Meetリンクが自動生成',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-medium text-gray-900 mb-2">面談が確定しました</h3>
              <p className="text-sm text-gray-600">
                2024年2月15日 14:00〜15:00
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-900 mb-3">面談情報</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Zoomリンク:</span>
                  <button className="text-blue-600 hover:underline">https://zoom.us/j/123456789</button>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">ミーティングID:</span>
                  <span className="font-mono">123 456 789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">パスコード:</span>
                  <span className="font-mono">RightArm2024</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm">
                📅 カレンダーに追加
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm">
                🔗 リンクをコピー
              </button>
            </div>
          </div>
        )
      }
    }
  ]

  // 振込情報フロー
  const paymentFlow = [
    {
      step: 1,
      title: '契約成立後の請求書画面',
      description: '面談終了→契約成立後、請求書が自動生成される',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">請求書 INV-001</h3>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                支払い待ち
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">振込先情報</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">銀行:</span>
                  <span className="ml-2 font-medium">三井住友銀行</span>
                </div>
                <div>
                  <span className="text-gray-500">支店:</span>
                  <span className="ml-2 font-medium">渋谷支店</span>
                </div>
                <div>
                  <span className="text-gray-500">口座:</span>
                  <span className="ml-2 font-medium">普通 1234567</span>
                </div>
                <div>
                  <span className="text-gray-500">名義:</span>
                  <span className="ml-2 font-medium">RightArm株式会社</span>
                </div>
              </div>
              <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center">
                📋 振込先情報をコピー
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>合計金額</span>
                <span>¥1,050,000</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                顧問料 ¥1,000,000 + 手数料5% ¥50,000
              </p>
            </div>
          </div>
        )
      }
    },
    {
      step: 2,
      title: '証憑アップロード画面',
      description: '支払い後、振込証明書などをドラッグ&ドロップでアップロード',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">証憑アップロード</h3>
            
            <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📎</div>
              <p className="text-gray-600 mb-2">
                証憑をドラッグ&ドロップ、またはクリックしてファイルを選択
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF、画像ファイル（PNG、JPG）、Excel等をアップロード可能
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                ファイルを選択
              </button>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">アップロード済みファイル</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-900">振込証明書.pdf</p>
                      <p className="text-sm text-gray-500">245.7 KB</p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-sm">削除</button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      step: 3,
      title: '支払い報告ボタン',
      description: 'ファイルアップロード後、支払い報告ボタンで管理者に通知',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">支払い手続き</h3>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">📋 手続きの流れ:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>上記振込先に支払い</li>
                  <li className="text-green-600 font-medium">✓ 振込証明書等をアップロード</li>
                  <li className="text-blue-600 font-medium">← 支払い報告ボタンを押下</li>
                  <li>管理者が手動で入金確認</li>
                  <li>管理者がステータス更新・通知送信</li>
                  <li>契約開始</li>
                </ol>
              </div>

              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                支払い報告
              </button>

              <div className="text-center text-sm text-gray-500">
                ↓ クリック後
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  支払い報告を受理しました。管理者の入金確認をお待ちください。
                </p>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      step: 4,
      title: '管理者による入金確認',
      description: '管理者が管理画面で手動確認・ステータス更新',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">🛠️ 管理画面 - 入金確認</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">請求書 INV-001</h4>
                    <p className="text-sm text-gray-600">株式会社テックスタート × 山田太郎CFO</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    支払い報告済み
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-700 mb-2">証憑ファイル:</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📄</span>
                    <span className="text-sm">振込証明書.pdf</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    ✅ 入金確認完了
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    ❌ 差戻し
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                ↓ 「入金確認完了」クリック後、自動で通知送信
              </div>
            </div>
          </div>
        )
      }
    },
    {
      step: 5,
      title: '契約開始通知',
      description: 'ステータス更新後、企業・CFOに自動で通知送信',
      screenshot: {
        component: (
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-medium text-gray-900 mb-2">契約開始通知を送信</h3>
              <p className="text-sm text-gray-600">
                企業・CFO双方に自動で通知メールが送信されます
              </p>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-blue-900">📧 企業様向け通知</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">送信済み</span>
                </div>
                <p className="text-xs text-blue-800">
                  件名: 【RightArm】契約開始のお知らせ<br/>
                  宛先: contact@techstart.com
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-blue-900">📧 CFO様向け通知</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">送信済み</span>
                </div>
                <p className="text-xs text-blue-800">
                  件名: 【RightArm】契約開始のお知らせ<br/>
                  宛先: yamada@example.com
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ 契約開始完了</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p>• 契約開始日: 2024年2月15日</p>
                <p>• ステータス: <span className="font-semibold">契約中</span></p>
                <p>• 通知送信: 完了</p>
              </div>
            </div>
          </div>
        )
      }
    }
  ]

  const getCurrentFlow = () => {
    return selectedFlow === 'meeting' ? meetingFlow : paymentFlow
  }

  const flow = getCurrentFlow()
  const maxStep = flow.length

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                🎬 システムフロー デモ
              </h1>
              <p className="text-gray-600">
                面談設定と支払い処理の流れを可視化 - デモンストレーション用画面
              </p>
            </div>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              デモ版専用
            </div>
          </div>

          {/* フロー選択 */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => {
                setSelectedFlow('meeting')
                setCurrentStep(1)
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedFlow === 'meeting'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📅 面談リンク発行フロー
            </button>
            <button
              onClick={() => {
                setSelectedFlow('payment')
                setCurrentStep(1)
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedFlow === 'payment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              💰 振込情報・支払いフロー
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ステップナビゲーション */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedFlow === 'meeting' ? '面談設定の流れ' : '支払い処理の流れ'}
              </h3>
              <div className="space-y-3">
                {flow.map((step, index) => (
                  <button
                    key={step.step}
                    onClick={() => setCurrentStep(step.step)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStep === step.step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep === step.step
                          ? 'bg-white text-blue-600'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.step}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className={`text-xs ${
                          currentStep === step.step ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* ステップヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Step {currentStep}: {flow[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {flow[currentStep - 1].description}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {currentStep} / {maxStep}
                </div>
              </div>

              {/* スクリーンショット/デモ画面 */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-6">
                  <div className="max-w-md mx-auto">
                    {flow[currentStep - 1].screenshot.component}
                  </div>
                </div>
              </div>

              {/* ナビゲーション */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  ← 前のステップ
                </button>

                <div className="flex space-x-1">
                  {flow.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index + 1 === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep(Math.min(maxStep, currentStep + 1))}
                  disabled={currentStep === maxStep}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === maxStep
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  次のステップ →
                </button>
              </div>
            </div>

            {/* 補足説明 */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">
                💡 実装時の技術詳細
              </h3>
              <div className="text-sm text-yellow-700 space-y-1">
                {selectedFlow === 'meeting' ? (
                  <>
                    <p>• 面談リンクはZoom APIを使用して自動生成</p>
                    <p>• カレンダー連携はGoogle Calendar API / Outlook APIで実装</p>
                    <p>• リマインダー機能はGitHub Actionsで定期実行</p>
                    <p>• 参加者への通知はResendで自動メール送信</p>
                  </>
                ) : (
                  <>
                    <p>• 振込先情報はENV変数で管理（シンプル・安全）</p>
                    <p>• ファイルアップロードはVercel Blob Storageに保存</p>
                    <p>• 支払い確認は管理者が管理画面で手動確認・承認</p>
                    <p>• 管理者の操作後、Resendで自動ステータス更新・通知送信</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 関連リンク */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">関連ページ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/messages" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">💬 メッセージ画面</h4>
              <p className="text-sm text-gray-600">面談設定の実際の操作を確認</p>
            </Link>
            <Link 
              href="/contracts/1/invoice" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">💰 請求書画面</h4>
              <p className="text-sm text-gray-600">振込情報と支払い報告機能を確認</p>
            </Link>
            <Link 
              href="/meetings" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">📅 面談予定</h4>
              <p className="text-sm text-gray-600">確定した面談の管理画面</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}