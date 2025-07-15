-- Supabase Storage Buckets Setup Script
-- ストレージバケット初期設定

-- プロフィール画像バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rextrix-profile-images',
  'rextrix-profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 企業ロゴバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rextrix-company-logos', 
  'rextrix-company-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- 契約書類バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rextrix-contract-documents',
  'rextrix-contract-documents', 
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- 請求書PDFバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rextrix-invoice-pdfs',
  'rextrix-invoice-pdfs',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 支払証明バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rextrix-payment-proofs',
  'rextrix-payment-proofs',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 添付ファイルバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rextrix-attachments',
  'rextrix-attachments',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile images (public read, authenticated write)
CREATE POLICY "Public read access for profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'rextrix-profile-images');

CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rextrix-profile-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'rextrix-profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (bucket_id = 'rextrix-profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for company logos (public read, authenticated write)
CREATE POLICY "Public read access for company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'rextrix-company-logos');

CREATE POLICY "Authenticated users can upload company logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rextrix-company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own company logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'rextrix-company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own company logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'rextrix-company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Private bucket policies (authenticated users only)
CREATE POLICY "Authenticated read access for contract documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'rextrix-contract-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload contract documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rextrix-contract-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own contract documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'rextrix-contract-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contract documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'rextrix-contract-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for other private buckets
CREATE POLICY "Authenticated read access for invoice PDFs" ON storage.objects
  FOR SELECT USING (bucket_id = 'rextrix-invoice-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload invoice PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rextrix-invoice-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated read access for payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'rextrix-payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rextrix-payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated read access for attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'rextrix-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rextrix-attachments' AND auth.role() = 'authenticated');