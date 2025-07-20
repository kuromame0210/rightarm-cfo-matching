'use client'

import React, { useState, useRef, memo } from 'react'
import Image from 'next/image'
import { 
  uploadFile, 
  validateFile, 
  formatFileSize, 
  isImageFile, 
  isPdfFile,
  type FileType 
} from '@/lib/storage'

interface FileUploadProps {
  fileType: FileType
  userId: string
  onUploadSuccess?: (url: string, filePath: string) => void
  onUploadError?: (error: string) => void
  currentFileUrl?: string
  accept?: string
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
}

const FileUpload = memo(({
  fileType,
  userId,
  onUploadSuccess,
  onUploadError,
  currentFileUrl,
  accept,
  maxFiles = 1,
  multiple = false,
  disabled = false,
  className = ''
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    // Limit number of files
    const filesToProcess = multiple ? files.slice(0, maxFiles) : [files[0]]
    
    // Create preview URLs for images
    const newPreviewUrls: string[] = []
    filesToProcess.forEach(file => {
      if (isImageFile(file)) {
        const previewUrl = URL.createObjectURL(file)
        newPreviewUrls.push(previewUrl)
      }
    })
    setPreviewUrls(newPreviewUrls)

    // Upload files
    for (const file of filesToProcess) {
      await uploadSingleFile(file)
    }
  }

  const uploadSingleFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file before upload
      const validation = validateFile(file, fileType)
      if (!validation.valid) {
        onUploadError?.(validation.error || 'ファイルが無効です')
        return
      }

      const result = await uploadFile(file, fileType, userId, {
        onProgress: (progress) => {
          setUploadProgress(progress)
        },
        upsert: !multiple
      })

      if (result.success && result.url) {
        onUploadSuccess?.(result.url, result.data?.path || '')
      } else {
        onUploadError?.(result.error || 'アップロードに失敗しました')
      }
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.('アップロードでエラーが発生しました')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const getFileTypeDisplay = () => {
    switch (fileType) {
      case 'PROFILE_IMAGE':
        return 'プロフィール画像'
      case 'COMPANY_LOGO':
        return '企業ロゴ'
      case 'CONTRACT_DOCUMENT':
        return '契約書'
      case 'INVOICE_PDF':
        return '請求書'
      case 'PAYMENT_PROOF':
        return '支払い証明書'
      case 'ATTACHMENT':
        return '添付ファイル'
      default:
        return 'ファイル'
    }
  }

  const getAcceptedFormats = () => {
    switch (fileType) {
      case 'PROFILE_IMAGE':
      case 'COMPANY_LOGO':
        return '.jpg, .jpeg, .png, .webp'
      case 'CONTRACT_DOCUMENT':
        return '.pdf, .doc, .docx'
      case 'INVOICE_PDF':
        return '.pdf'
      case 'PAYMENT_PROOF':
        return '.jpg, .jpeg, .png, .webp, .pdf'
      case 'ATTACHMENT':
        return '.jpg, .jpeg, .png, .webp, .pdf, .doc, .docx, .xls, .xlsx, .txt, .csv'
      default:
        return '全ての形式'
    }
  }

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || getAcceptedFormats()}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Current file preview */}
      {currentFileUrl && !isUploading && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">現在のファイル:</p>
          {isImageFile(currentFileUrl) ? (
            <Image
              src={currentFileUrl}
              alt="Current file"
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-lg border"
              unoptimized={true}
            />
          ) : (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                📄
              </div>
              <span className="text-sm text-gray-700">
                {isPdfFile(currentFileUrl) ? 'PDF ファイル' : 'ファイル'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {isUploading ? (
          <div className="space-y-3">
            <div className="text-blue-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <p className="text-sm text-gray-600">アップロード中...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            {previewUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {previewUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded border"
                    unoptimized={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            
            <p className="text-sm font-medium text-gray-900">
              {getFileTypeDisplay()}をアップロード
            </p>
            <p className="text-xs text-gray-500">
              クリックまたはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-400">
              対応形式: {getAcceptedFormats()}
            </p>
            {multiple && (
              <p className="text-xs text-gray-400">
                最大 {maxFiles} ファイル
              </p>
            )}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="mt-2 text-xs text-gray-500">
        {fileType === 'PROFILE_IMAGE' && 'プロフィール画像は最大5MBまで'}
        {fileType === 'COMPANY_LOGO' && '企業ロゴは最大5MBまで'}
        {fileType === 'CONTRACT_DOCUMENT' && '契約書は最大10MBまで'}
        {fileType === 'INVOICE_PDF' && '請求書は最大10MBまで'}
        {fileType === 'PAYMENT_PROOF' && '支払い証明書は最大10MBまで'}
        {fileType === 'ATTACHMENT' && '添付ファイルは最大20MBまで'}
      </div>
    </div>
  )
})

FileUpload.displayName = 'FileUpload'
export default FileUpload