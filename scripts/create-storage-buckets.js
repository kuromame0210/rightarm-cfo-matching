#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createStorageBuckets() {
  console.log('🚀 ストレージバケット作成開始');
  
  const buckets = [
    {
      id: 'rextrix-profile-images',
      name: 'rextrix-profile-images',
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    {
      id: 'rextrix-company-logos',
      name: 'rextrix-company-logos', 
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    },
    {
      id: 'rextrix-contract-documents',
      name: 'rextrix-contract-documents',
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    {
      id: 'rextrix-invoice-pdfs',
      name: 'rextrix-invoice-pdfs',
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['application/pdf']
    },
    {
      id: 'rextrix-payment-proofs',
      name: 'rextrix-payment-proofs',
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    },
    {
      id: 'rextrix-attachments',
      name: 'rextrix-attachments',
      public: false,
      fileSizeLimit: 20 * 1024 * 1024, // 20MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    }
  ];

  for (const bucket of buckets) {
    console.log(`\n📦 バケット作成: ${bucket.id}`);
    
    const { data, error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ バケット ${bucket.id} は既に存在します`);
      } else {
        console.error(`❌ バケット ${bucket.id} 作成エラー:`, error);
      }
    } else {
      console.log(`✅ バケット ${bucket.id} 作成成功`);
    }
  }
  
  console.log('\n🎉 ストレージバケット作成完了');
}

createStorageBuckets().catch(console.error);