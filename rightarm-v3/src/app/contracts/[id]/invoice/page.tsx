'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // サンプル請求書データ（v5.1仕様書準拠）
  const invoiceData = {
    id: 'INV-001',
    contractId: params.id,
    status: 'pending', // pending/paid/verified
    cfoName: '山田 太郎',
    companyName: '株式会社テックスタート',
    period: '2024年1月',
    issueDate: '2024-01-31',
    dueDate: '2024-02-29',
    
    // 料金詳細
    consultingFee: 1000000, // 顧問料
    platformFeeRate: 0.05, // 手数料率5%
    
    // 振込先情報
    bankInfo: {
      bankName: '三井住友銀行',
      branchName: '渋谷支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'RightArm株式会社'
    }
  }

  const platformFee = Math.floor(invoiceData.consultingFee * invoiceData.platformFeeRate)
  const totalAmount = invoiceData.consultingFee + platformFee

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '支払い待ち'
      case 'paid': return '支払い報告済み'
      case 'verified': return '入金確認済み'
      default: return '不明'
    }
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // 振込先情報のコピー
  const copyBankInfo = () => {
    const bankText = `${invoiceData.bankInfo.bankName} ${invoiceData.bankInfo.branchName} ${invoiceData.bankInfo.accountType} ${invoiceData.bankInfo.accountNumber}`
    navigator.clipboard.writeText(bankText).then(() => {
      showToastMessage('振込先情報をコピーしました')
    })
  }

  // ドラッグ&ドロップ処理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => 
      file.type.includes('image/') || 
      file.type.includes('pdf') || 
      file.type.includes('application/')
    )
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles])
      showToastMessage(`${validFiles.length}件のファイルをアップロードしました`)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
      showToastMessage(`${files.length}件のファイルをアップロードしました`)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    showToastMessage('ファイルを削除しました')
  }

  const handlePaymentReport = () => {
    if (uploadedFiles.length === 0) {
      showToastMessage('証憑をアップロードしてください')
      return
    }
    
    // 実際の実装では API を呼び出してステータスを更新
    showToastMessage('支払い報告を送信しました。管理者の確認をお待ちください。')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
          >
            ← 戻る
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                請求書 {invoiceData.id}
              </h1>
              <p className="text-gray-600">{invoiceData.companyName} × {invoiceData.cfoName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusBadge(invoiceData.status)}`}>
              {getStatusText(invoiceData.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* v5.1仕様書準拠：InvoiceCard */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">請求内容</h2>
              
              <div className="space-y-4">
                {/* 基本情報 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">対象期間:</span>
                    <p className="font-medium">{invoiceData.period}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">発行日:</span>
                    <p className="font-medium">{invoiceData.issueDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">支払期限:</span>
                    <p className="font-medium">{invoiceData.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">契約ID:</span>
                    <p className="font-medium">{invoiceData.contractId}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {/* 料金明細 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">顧問料</span>
                      <span className="font-medium">¥{invoiceData.consultingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">プラットフォーム手数料({(invoiceData.platformFeeRate * 100)}%)</span>
                      <span className="font-medium">¥{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span className="text-gray-900">合計</span>
                        <span className="text-gray-900">¥{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 振込先情報 */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">振込先</h3>
                    <button 
                      onClick={copyBankInfo}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      📋 コピー
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">銀行:</span>
                        <span className="ml-2 font-medium">{invoiceData.bankInfo.bankName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">支店:</span>
                        <span className="ml-2 font-medium">{invoiceData.bankInfo.branchName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">口座:</span>
                        <span className="ml-2 font-medium">{invoiceData.bankInfo.accountType} {invoiceData.bankInfo.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">名義:</span>
                        <span className="ml-2 font-medium">{invoiceData.bankInfo.accountHolder}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 証憑アップロード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">証憑アップロード</h2>
              
              {/* ドラッグ&ドロップエリア */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-gray-400 text-4xl mb-4">📎</div>
                <p className="text-gray-600 mb-2">
                  証憑をドラッグ&ドロップ、またはクリックしてファイルを選択
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PDF、画像ファイル（PNG、JPG）、Excel等をアップロード可能
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  ファイルを選択
                </label>
              </div>

              {/* アップロード済みファイル一覧 */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">アップロード済みファイル</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">支払い手続き</h3>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">📋 手続きの流れ:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>上記振込先に支払い</li>
                    <li>振込証明書等をアップロード</li>
                    <li>支払い報告ボタンを押下</li>
                    <li>管理者の入金確認</li>
                    <li>契約開始</li>
                  </ol>
                </div>

                {invoiceData.status === 'pending' && (
                  <button 
                    onClick={handlePaymentReport}
                    disabled={uploadedFiles.length === 0}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      uploadedFiles.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    支払い報告
                  </button>
                )}

                {invoiceData.status === 'paid' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      支払い報告を受理しました。管理者の入金確認をお待ちください。
                    </p>
                  </div>
                )}

                {invoiceData.status === 'verified' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      入金が確認されました。契約が開始されています。
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">お問い合わせ</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    支払いに関するご質問がございましたら、お気軽にお問い合わせください。
                  </p>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    サポートに連絡
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  )
}