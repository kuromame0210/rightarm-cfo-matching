'use client'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function ProfileSetupContent() {
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as 'company' | 'cfo' | null
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // デフォルトアバター選択肢
  const defaultAvatars = [
    '👤', '🏢', '💼', '📊', '💰', '📈', 
    '⚡', '🎯', '🔥', '💎', '🚀', '🌟'
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        alert('ファイルサイズは5MB以下にしてください')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setUploadedFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const selectDefaultAvatar = (avatar: string) => {
    setSelectedImage(avatar)
    setUploadedFile(null)
  }

  const handleSkip = () => {
    // スキップ時は適切な画面に遷移
    if (userType === 'company') {
      window.location.href = '/discover/cfos'
    } else {
      window.location.href = '/discover/companies'
    }
  }

  const handleComplete = () => {
    // プロフィール画像を保存（実際はAPIコール）
    console.log('Selected image:', selectedImage)
    console.log('Uploaded file:', uploadedFile)
    
    // 完了後は適切な画面に遷移
    if (userType === 'company') {
      window.location.href = '/discover/cfos'
    } else {
      window.location.href = '/discover/companies'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">プロフィール画像設定</h1>
          <p className="text-gray-600">
            {userType === 'company' ? '企業' : 'CFO'}のプロフィール画像を設定しましょう
          </p>
          <p className="text-sm text-gray-500 mt-2">
            設定しない場合はスキップすることもできます
          </p>
        </div>

        {/* 現在選択中の画像プレビュー */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-4xl border-2 border-gray-200">
            {selectedImage ? (
              selectedImage.startsWith('data:') ? (
                <Image 
                  src={selectedImage} 
                  alt="Profile" 
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                  unoptimized={true}
                />
              ) : (
                <span>{selectedImage}</span>
              )
            ) : (
              <span className="text-gray-400">👤</span>
            )}
          </div>
        </div>

        {/* ファイルアップロード */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">画像をアップロード</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-600 hover:text-gray-900"
            >
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm">クリックして画像を選択</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (最大5MB)</p>
            </button>
          </div>
        </div>

        {/* デフォルトアバター選択 */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">またはアイコンから選択</h3>
          <div className="grid grid-cols-6 gap-3">
            {defaultAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => selectDefaultAvatar(avatar)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all hover:scale-110 ${
                  selectedImage === avatar
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={handleComplete}
            disabled={!selectedImage}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              selectedImage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            プロフィール画像を設定
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            スキップ
          </button>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>プロフィール画像は後から設定・変更することもできます</p>
        </div>
      </div>
    </div>
  )
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  )
}