-- Set up Supabase Storage for store images
-- Run this in Supabase SQL Editor

-- Create the storage bucket for store images
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-images', 'store-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for authenticated users
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload store images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'store-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'store-images');

-- Allow public to read images (for displaying in store listings)
CREATE POLICY "Public can view store images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-images');

-- Note: After running this SQL, the storage bucket will be created
-- Users can upload store logos and they will be publicly accessible
