-- Alternative storage fix for Supabase
-- These commands should work even without being the owner of storage.objects

-- Option 1: Create permissive policies instead of disabling RLS
-- Drop existing restrictive policies first
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Store Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Store Logos" ON storage.objects;

-- Create very permissive policies for authenticated users
CREATE POLICY "Allow authenticated uploads to product-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated uploads to store-logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to both buckets
CREATE POLICY "Allow public read product-images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow public read store-logos" ON storage.objects
FOR SELECT USING (bucket_id = 'store-logos');

-- Allow authenticated users to update/delete their own files
CREATE POLICY "Allow authenticated updates product-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated updates store-logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated deletes product-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated deletes store-logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);
