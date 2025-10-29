-- Supabase Storage Setup Script
-- Run this in your Supabase SQL Editor to create the required storage buckets

-- Create product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create store-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-logos',
  'store-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Set up RLS policies for public access
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Store Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Store Logos" ON storage.objects;

-- Product images policies
CREATE POLICY "Public Access Product Images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Upload Product Images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Update Product Images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete Product Images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Store logos policies
CREATE POLICY "Public Access Store Logos" ON storage.objects
FOR SELECT USING (bucket_id = 'store-logos');

CREATE POLICY "Authenticated Upload Store Logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Update Store Logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete Store Logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);
