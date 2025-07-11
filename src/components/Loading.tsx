'use client'

import { memo } from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  showText?: boolean
}

const Loading = memo(({ 
  size = 'md', 
  text = '読み込み中...', 
  className = '',
  showText = true 
}: LoadingProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-12 h-12'
      default:
        return 'w-8 h-8'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${getSizeClasses()}`}></div>
      {showText && (
        <p className={`text-gray-600 ${getTextSize()}`}>{text}</p>
      )}
    </div>
  )
})

Loading.displayName = 'Loading'

// フルスクリーンローディング
export const FullScreenLoading = memo(({ text = '読み込み中...' }: { text?: string }) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <Loading size="lg" text={text} />
  </div>
))

FullScreenLoading.displayName = 'FullScreenLoading'

// インライン ローディング（小さなエリア用）
export const InlineLoading = memo(({ text, className }: { text?: string; className?: string }) => (
  <div className={`py-8 ${className}`}>
    <Loading size="sm" text={text} />
  </div>
))

InlineLoading.displayName = 'InlineLoading'

// ボタン内のローディング
export const ButtonLoading = memo(() => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
))

ButtonLoading.displayName = 'ButtonLoading'

export default Loading