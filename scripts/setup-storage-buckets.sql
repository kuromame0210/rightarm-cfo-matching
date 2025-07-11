-- Setup Storage Buckets for Rextrix
-- Run this in Supabase SQL Editor

-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('rextrix-profile-images', 'rextrix-profile-images', true),
  ('rextrix-company-logos', 'rextrix-company-logos', true),
  ('rextrix-contract-documents', 'rextrix-contract-documents', false),
  ('rextrix-invoice-pdfs', 'rextrix-invoice-pdfs', false),
  ('rextrix-payment-proofs', 'rextrix-payment-proofs', false),
  ('rextrix-attachments', 'rextrix-attachments', false)
on conflict (id) do nothing;

-- Create RLS policies for rextrix-profile-images bucket
create policy "Users can view profile images"
on storage.objects for select
using (bucket_id = 'rextrix-profile-images');

create policy "Users can upload their own profile images"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-profile-images' 
  and (storage.foldername(name))[1] = 'profiles'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can update their own profile images"
on storage.objects for update
using (
  bucket_id = 'rextrix-profile-images'
  and (storage.foldername(name))[1] = 'profiles'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can delete their own profile images"
on storage.objects for delete
using (
  bucket_id = 'rextrix-profile-images'
  and (storage.foldername(name))[1] = 'profiles'
  and auth.uid()::text = (storage.foldername(name))[2]
);

-- Create RLS policies for rextrix-company-logos bucket
create policy "Users can view company logos"
on storage.objects for select
using (bucket_id = 'rextrix-company-logos');

create policy "Users can upload their own company logos"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-company-logos'
  and (storage.foldername(name))[1] = 'companies'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can update their own company logos"
on storage.objects for update
using (
  bucket_id = 'rextrix-company-logos'
  and (storage.foldername(name))[1] = 'companies'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can delete their own company logos"
on storage.objects for delete
using (
  bucket_id = 'rextrix-company-logos'
  and (storage.foldername(name))[1] = 'companies'
  and auth.uid()::text = (storage.foldername(name))[2]
);

-- Create RLS policies for rextrix-contract-documents bucket (private)
create policy "Users can view their own contract documents"
on storage.objects for select
using (
  bucket_id = 'rextrix-contract-documents'
  and (storage.foldername(name))[1] = 'contracts'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can upload their own contract documents"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-contract-documents'
  and (storage.foldername(name))[1] = 'contracts'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can update their own contract documents"
on storage.objects for update
using (
  bucket_id = 'rextrix-contract-documents'
  and (storage.foldername(name))[1] = 'contracts'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can delete their own contract documents"
on storage.objects for delete
using (
  bucket_id = 'rextrix-contract-documents'
  and (storage.foldername(name))[1] = 'contracts'
  and auth.uid()::text = (storage.foldername(name))[2]
);

-- Create RLS policies for invoice-pdfs bucket (private)
create policy "Users can view their own invoice PDFs"
on storage.objects for select
using (
  bucket_id = 'rextrix-invoice-pdfs'
  and (storage.foldername(name))[1] = 'invoices'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can upload their own invoice PDFs"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-invoice-pdfs'
  and (storage.foldername(name))[1] = 'invoices'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can update their own invoice PDFs"
on storage.objects for update
using (
  bucket_id = 'rextrix-invoice-pdfs'
  and (storage.foldername(name))[1] = 'invoices'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can delete their own invoice PDFs"
on storage.objects for delete
using (
  bucket_id = 'rextrix-invoice-pdfs'
  and (storage.foldername(name))[1] = 'invoices'
  and auth.uid()::text = (storage.foldername(name))[2]
);

-- Create RLS policies for payment-proofs bucket (private)
create policy "Users can view their own payment proofs"
on storage.objects for select
using (
  bucket_id = 'rextrix-payment-proofs'
  and (storage.foldername(name))[1] = 'payments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can upload their own payment proofs"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-payment-proofs'
  and (storage.foldername(name))[1] = 'payments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can update their own payment proofs"
on storage.objects for update
using (
  bucket_id = 'rextrix-payment-proofs'
  and (storage.foldername(name))[1] = 'payments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can delete their own payment proofs"
on storage.objects for delete
using (
  bucket_id = 'rextrix-payment-proofs'
  and (storage.foldername(name))[1] = 'payments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

-- Create RLS policies for attachments bucket (private)
create policy "Users can view their own attachments"
on storage.objects for select
using (
  bucket_id = 'rextrix-attachments'
  and (storage.foldername(name))[1] = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can upload their own attachments"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-attachments'
  and (storage.foldername(name))[1] = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can update their own attachments"
on storage.objects for update
using (
  bucket_id = 'rextrix-attachments'
  and (storage.foldername(name))[1] = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create policy "Users can delete their own attachments"
on storage.objects for delete
using (
  bucket_id = 'rextrix-attachments'
  and (storage.foldername(name))[1] = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[2]
);