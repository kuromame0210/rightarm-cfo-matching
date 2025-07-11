// RightArm v3 File Storage Management with Supabase Storage
import { supabase } from './supabase'

// Storage buckets configuration
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'rextrix-profile-images',
  COMPANY_LOGOS: 'rextrix-company-logos',
  CONTRACT_DOCUMENTS: 'rextrix-contract-documents',
  INVOICE_PDFS: 'rextrix-invoice-pdfs',
  PAYMENT_PROOFS: 'rextrix-payment-proofs',
  ATTACHMENTS: 'rextrix-attachments'
} as const

// File type configurations
export const FILE_CONFIGS = {
  PROFILE_IMAGE: {
    bucket: STORAGE_BUCKETS.PROFILE_IMAGES,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  COMPANY_LOGO: {
    bucket: STORAGE_BUCKETS.COMPANY_LOGOS,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
  },
  CONTRACT_DOCUMENT: {
    bucket: STORAGE_BUCKETS.CONTRACT_DOCUMENTS,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx']
  },
  INVOICE_PDF: {
    bucket: STORAGE_BUCKETS.INVOICE_PDFS,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['.pdf']
  },
  PAYMENT_PROOF: {
    bucket: STORAGE_BUCKETS.PAYMENT_PROOFS,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
  },
  ATTACHMENT: {
    bucket: STORAGE_BUCKETS.ATTACHMENTS,
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv']
  }
} as const

export type FileType = keyof typeof FILE_CONFIGS
export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// File validation
export const validateFile = (file: File, fileType: FileType): { valid: boolean; error?: string } => {
  const config = FILE_CONFIGS[fileType]
  
  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024)
    return { valid: false, error: `ファイルサイズが${maxSizeMB}MBを超えています` }
  }
  
  // Check file type
  const allowedTypes = config.allowedTypes as readonly string[]
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `このファイル形式は許可されていません。許可形式: ${config.allowedExtensions.join(', ')}` }
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = config.allowedExtensions as readonly string[]
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `この拡張子は許可されていません。許可拡張子: ${config.allowedExtensions.join(', ')}` }
  }
  
  return { valid: true }
}

// Generate unique file path
export const generateFilePath = (userId: string, fileType: FileType, fileName: string): string => {
  const timestamp = Date.now()
  const extension = '.' + fileName.split('.').pop()?.toLowerCase()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  switch (fileType) {
    case 'PROFILE_IMAGE':
      return `profiles/${userId}/avatar_${timestamp}${extension}`
    case 'COMPANY_LOGO':
      return `companies/${userId}/logo_${timestamp}${extension}`
    case 'CONTRACT_DOCUMENT':
      return `contracts/${userId}/${timestamp}_${sanitizedFileName}`
    case 'INVOICE_PDF':
      return `invoices/${userId}/${timestamp}_${sanitizedFileName}`
    case 'PAYMENT_PROOF':
      return `payments/${userId}/${timestamp}_${sanitizedFileName}`
    case 'ATTACHMENT':
      return `attachments/${userId}/${timestamp}_${sanitizedFileName}`
    default:
      return `misc/${userId}/${timestamp}_${sanitizedFileName}`
  }
}

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File,
  fileType: FileType,
  userId: string,
  options?: {
    onProgress?: (progress: number) => void
    upsert?: boolean
  }
): Promise<{ success: boolean; data?: any; error?: string; url?: string }> => {
  try {
    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const config = FILE_CONFIGS[fileType]
    const filePath = generateFilePath(userId, fileType, file.name)

    // Upload via secure API endpoint
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileType', fileType)
    formData.append('userId', userId)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Upload API error:', result)
      return { success: false, error: result.error || 'ファイルのアップロードに失敗しました' }
    }

    return result

  } catch (error) {
    console.error('Upload file error:', error)
    return { success: false, error: 'ファイルのアップロードでエラーが発生しました' }
  }
}

// Delete file from Supabase Storage
export const deleteFile = async (
  filePath: string,
  bucket: StorageBucket
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      return { success: false, error: 'ファイルの削除に失敗しました' }
    }

    return { success: true }

  } catch (error) {
    console.error('Delete file error:', error)
    return { success: false, error: 'ファイルの削除でエラーが発生しました' }
  }
}

// Get file URL
export const getFileUrl = (filePath: string, bucket: StorageBucket): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// List files in a directory
export const listFiles = async (
  bucket: StorageBucket,
  path: string = '',
  options?: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: 'asc' | 'desc' }
  }
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: options?.limit,
        offset: options?.offset,
        sortBy: options?.sortBy
      })

    if (error) {
      console.error('Storage list error:', error)
      return { success: false, error: 'ファイル一覧の取得に失敗しました' }
    }

    return { success: true, data }

  } catch (error) {
    console.error('List files error:', error)
    return { success: false, error: 'ファイル一覧の取得でエラーが発生しました' }
  }
}

// Create signed URL for private files
export const createSignedUrl = async (
  filePath: string,
  bucket: StorageBucket,
  expiresIn: number = 3600 // 1 hour by default
): Promise<{ success: boolean; signedUrl?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Create signed URL error:', error)
      return { success: false, error: '署名付きURLの作成に失敗しました' }
    }

    return { success: true, signedUrl: data.signedUrl }

  } catch (error) {
    console.error('Create signed URL error:', error)
    return { success: false, error: '署名付きURLの作成でエラーが発生しました' }
  }
}

// Utility functions for common file operations
export const uploadProfileImage = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  return uploadFile(file, 'PROFILE_IMAGE', userId, { onProgress, upsert: true })
}

export const uploadCompanyLogo = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  return uploadFile(file, 'COMPANY_LOGO', userId, { onProgress, upsert: true })
}

export const uploadContractDocument = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  return uploadFile(file, 'CONTRACT_DOCUMENT', userId, { onProgress })
}

export const uploadInvoicePdf = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  return uploadFile(file, 'INVOICE_PDF', userId, { onProgress })
}

export const uploadPaymentProof = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  return uploadFile(file, 'PAYMENT_PROOF', userId, { onProgress })
}

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file extension from URL
export const getFileExtension = (url: string): string => {
  return url.split('.').pop()?.toLowerCase() || ''
}

// Check if file is image
export const isImageFile = (file: File | string): boolean => {
  if (typeof file === 'string') {
    const extension = getFileExtension(file)
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension)
  }
  return file.type.startsWith('image/')
}

// Check if file is PDF
export const isPdfFile = (file: File | string): boolean => {
  if (typeof file === 'string') {
    const extension = getFileExtension(file)
    return extension === 'pdf'
  }
  return file.type === 'application/pdf'
}