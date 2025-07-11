# RightArm 画像保存システム設計

## 概要
CFOマッチングプラットフォームにおける画像ファイルの保存、管理、配信を効率的かつ安全に行うためのシステム設計です。

## 対象画像タイプ

### 1. プロフィール画像
- **ユーザー**: CFO・企業担当者のプロフィール写真
- **企業ロゴ**: 企業のロゴ画像
- **サイズ**: 最大5MB、推奨サイズ 512x512px
- **フォーマット**: JPG, PNG, WebP

### 2. 添付ファイル（メッセージ用）
- **資料**: PDF、画像ファイル
- **サイズ**: 最大10MB
- **フォーマット**: PDF, JPG, PNG, DOC, DOCX

### 3. システム画像
- **デフォルトアバター**: アイコン形式のアバター
- **UI画像**: ロゴ、バナー等

## アーキテクチャ

### 基本構成
```
Client → Next.js API → Image Processing → Cloud Storage → CDN → Client
```

### 技術スタック
- **ストレージ**: AWS S3 / Google Cloud Storage
- **CDN**: CloudFlare / AWS CloudFront
- **画像処理**: Sharp (Node.js) / ImageMagick
- **データベース**: PostgreSQL (メタデータ管理)

## データベース設計

### images テーブル
```sql
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 基本情報
    original_filename VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL UNIQUE, -- 生成されたファイル名
    file_path TEXT NOT NULL, -- S3等のフルパス
    file_size INTEGER NOT NULL, -- バイト単位
    mime_type VARCHAR(100) NOT NULL,
    
    -- 画像メタデータ
    width INTEGER,
    height INTEGER,
    aspect_ratio DECIMAL(5,4), -- 16:9 = 1.7778
    
    -- 関連情報
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    usage_type ENUM('profile', 'company_logo', 'message_attachment', 'system') NOT NULL,
    related_id UUID, -- user_id, company_id, message_id等
    
    -- ステータス
    status ENUM('uploading', 'processing', 'ready', 'failed', 'deleted') DEFAULT 'uploading',
    is_public BOOLEAN DEFAULT FALSE,
    
    -- セキュリティ
    hash_md5 VARCHAR(32), -- 重複チェック用
    hash_sha256 VARCHAR(64), -- 整合性チェック用
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- 一時ファイルの場合
    
    -- 索引
    INDEX idx_images_uploaded_by (uploaded_by),
    INDEX idx_images_usage_related (usage_type, related_id),
    INDEX idx_images_status (status),
    INDEX idx_images_hash_md5 (hash_md5),
    INDEX idx_images_created_at (created_at DESC)
);
```

### image_variants テーブル（リサイズ版管理）
```sql
CREATE TABLE image_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    
    -- バリアント情報
    variant_type ENUM('thumbnail', 'small', 'medium', 'large', 'avatar') NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    quality INTEGER DEFAULT 85, -- JPEG品質
    
    -- ファイル情報
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- ステータス
    status ENUM('generating', 'ready', 'failed') DEFAULT 'generating',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(original_image_id, variant_type),
    
    -- 索引
    INDEX idx_image_variants_original (original_image_id),
    INDEX idx_image_variants_type (variant_type)
);
```

## ファイル構造

### S3バケット構造
```
rightarm-images/
├── profiles/
│   ├── users/
│   │   └── {user_id}/
│   │       ├── original_{timestamp}_{hash}.jpg
│   │       ├── avatar_{timestamp}_{hash}.webp (64x64)
│   │       ├── small_{timestamp}_{hash}.webp (128x128)
│   │       └── medium_{timestamp}_{hash}.webp (256x256)
│   └── companies/
│       └── {company_id}/
│           ├── logo_original_{timestamp}_{hash}.png
│           ├── logo_small_{timestamp}_{hash}.webp
│           └── logo_medium_{timestamp}_{hash}.webp
├── attachments/
│   └── {year}/{month}/
│       └── {message_id}/
│           └── {filename}_{hash}.{ext}
├── temp/
│   └── {upload_id}/
│       └── {filename}
└── system/
    ├── avatars/
    └── defaults/
```

## API設計

### 1. 画像アップロード
```typescript
// POST /api/images/upload
interface UploadRequest {
  file: File;
  usage_type: 'profile' | 'company_logo' | 'message_attachment';
  related_id?: string;
  resize_options?: {
    generate_thumbnails: boolean;
    max_width?: number;
    max_height?: number;
  };
}

interface UploadResponse {
  success: boolean;
  image_id: string;
  url: string;
  variants: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
}
```

### 2. 画像取得
```typescript
// GET /api/images/{image_id}?variant=medium&format=webp
interface ImageResponse {
  url: string;
  width: number;
  height: number;
  file_size: number;
  cache_control: string;
}
```

### 3. 画像削除
```typescript
// DELETE /api/images/{image_id}
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

## 画像処理パイプライン

### アップロード時の処理フロー
```javascript
async function processImageUpload(file, options) {
  // 1. バリデーション
  validateFile(file);
  
  // 2. 一時保存
  const tempPath = await saveTempFile(file);
  
  // 3. メタデータ抽出
  const metadata = await extractImageMetadata(tempPath);
  
  // 4. ハッシュ計算（重複チェック）
  const hashes = await calculateHashes(tempPath);
  
  // 5. 重複チェック
  const existingImage = await checkDuplicate(hashes.md5);
  if (existingImage) {
    return reuseExistingImage(existingImage, options);
  }
  
  // 6. オリジナル保存
  const originalPath = await saveToStorage(tempPath, 'original');
  
  // 7. DB記録
  const imageRecord = await createImageRecord({
    ...metadata,
    ...hashes,
    file_path: originalPath,
    ...options
  });
  
  // 8. バリアント生成（非同期）
  generateVariants(imageRecord.id, tempPath);
  
  // 9. 一時ファイル削除
  await deleteTempFile(tempPath);
  
  return imageRecord;
}
```

### バリアント生成
```javascript
async function generateVariants(imageId, sourcePath) {
  const variants = [
    { type: 'avatar', width: 64, height: 64 },
    { type: 'small', width: 128, height: 128 },
    { type: 'medium', width: 256, height: 256 },
    { type: 'large', width: 512, height: 512 }
  ];
  
  for (const variant of variants) {
    try {
      // Sharp を使用してリサイズ
      const buffer = await sharp(sourcePath)
        .resize(variant.width, variant.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toBuffer();
      
      // ストレージに保存
      const variantPath = await saveVariantToStorage(buffer, variant);
      
      // DB記録
      await createVariantRecord(imageId, variant, variantPath);
      
    } catch (error) {
      console.error(`Failed to generate variant ${variant.type}:`, error);
    }
  }
}
```

## セキュリティ対策

### 1. ファイルバリデーション
```javascript
function validateFile(file) {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds limit');
  }
  
  // MIMEタイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // ファイル拡張子チェック
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension');
  }
  
  // ファイル内容検証（マジックナンバー）
  if (!validateFileContent(file)) {
    throw new Error('File content validation failed');
  }
}
```

### 2. アクセス制御
```javascript
// プロフィール画像のアクセス制御
function checkImageAccess(imageId, userId, userRole) {
  const image = getImageById(imageId);
  
  // パブリック画像は誰でもアクセス可
  if (image.is_public) {
    return true;
  }
  
  // 所有者はアクセス可
  if (image.uploaded_by === userId) {
    return true;
  }
  
  // 管理者はアクセス可
  if (userRole === 'admin') {
    return true;
  }
  
  // プロフィール画像は認証済みユーザーがアクセス可
  if (image.usage_type === 'profile' && userId) {
    return true;
  }
  
  return false;
}
```

### 3. URL署名（プライベート画像用）
```javascript
function generateSignedUrl(imageId, expiresIn = 3600) {
  const payload = {
    image_id: imageId,
    expires_at: Date.now() + (expiresIn * 1000)
  };
  
  const signature = crypto
    .createHmac('sha256', process.env.IMAGE_SIGNING_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `/api/images/${imageId}?signature=${signature}&expires=${payload.expires_at}`;
}
```

## パフォーマンス最適化

### 1. CDN設定
```javascript
// CloudFlare設定例
const cdnConfig = {
  cache_control: {
    'image/jpeg': 'public, max-age=31536000', // 1年
    'image/png': 'public, max-age=31536000',
    'image/webp': 'public, max-age=31536000'
  },
  compression: {
    enabled: true,
    brotli: true,
    gzip: true
  },
  auto_webp: true, // WebP自動変換
  auto_resize: true // 自動リサイズ
};
```

### 2. 遅延読み込み
```typescript
// React コンポーネント例
interface OptimizedImageProps {
  imageId: string;
  variant?: 'thumbnail' | 'small' | 'medium' | 'large';
  alt: string;
  className?: string;
}

export function OptimizedImage({ imageId, variant = 'medium', alt, className }: OptimizedImageProps) {
  const [src, setSrc] = useState<string>();
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const loadImage = async () => {
    try {
      const imageUrl = await getImageUrl(imageId, variant);
      setSrc(imageUrl);
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {loading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
```

### 3. キャッシュ戦略
```javascript
// Redis キャッシュ
class ImageCache {
  static async getImageUrl(imageId, variant = 'original') {
    const cacheKey = `image:${imageId}:${variant}`;
    
    // Redis からキャッシュ取得
    let url = await redis.get(cacheKey);
    
    if (!url) {
      // DBから取得
      url = await this.generateImageUrl(imageId, variant);
      
      // キャッシュに保存（1時間）
      await redis.setex(cacheKey, 3600, url);
    }
    
    return url;
  }
  
  static async invalidateCache(imageId) {
    const pattern = `image:${imageId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

## 運用・監視

### 1. メトリクス収集
```javascript
// 画像配信メトリクス
const imageMetrics = {
  upload_count: 0,
  upload_size_total: 0,
  download_count: 0,
  download_bandwidth: 0,
  cache_hit_rate: 0,
  error_rate: 0
};

function trackImageUpload(fileSize) {
  imageMetrics.upload_count++;
  imageMetrics.upload_size_total += fileSize;
}

function trackImageDownload(fileSize) {
  imageMetrics.download_count++;
  imageMetrics.download_bandwidth += fileSize;
}
```

### 2. ストレージ使用量管理
```sql
-- ストレージ使用量レポート
SELECT 
  usage_type,
  COUNT(*) as image_count,
  SUM(file_size) as total_size_bytes,
  SUM(file_size) / 1024 / 1024 as total_size_mb,
  AVG(file_size) as avg_size_bytes
FROM images 
WHERE status = 'ready' 
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY usage_type
ORDER BY total_size_bytes DESC;
```

### 3. クリーンアップジョブ
```javascript
// 定期的な不要ファイル削除
async function cleanupOrphanedImages() {
  // 30日以上前の一時ファイル
  const orphanedTemp = await db.query(`
    SELECT id, file_path FROM images 
    WHERE status = 'uploading' 
      AND created_at < NOW() - INTERVAL '30 days'
  `);
  
  for (const image of orphanedTemp) {
    await deleteFromStorage(image.file_path);
    await db.query('DELETE FROM images WHERE id = ?', [image.id]);
  }
  
  // 関連レコードが削除された画像
  const orphanedImages = await db.query(`
    SELECT i.id, i.file_path FROM images i
    LEFT JOIN users u ON i.related_id = u.id AND i.usage_type = 'profile'
    LEFT JOIN companies c ON i.related_id = c.id AND i.usage_type = 'company_logo'
    WHERE i.usage_type IN ('profile', 'company_logo')
      AND u.id IS NULL AND c.id IS NULL
  `);
  
  for (const image of orphanedImages) {
    await deleteImageAndVariants(image.id);
  }
}
```

この画像保存システム設計により、RightArmプラットフォームの画像を効率的かつ安全に管理できます。