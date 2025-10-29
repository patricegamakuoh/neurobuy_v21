-- Quick fix for storage upload issues
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS temporarily (quickest fix)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create permissive policies
-- Uncomment the lines below if you prefer this approach:

/*
-- Drop all existing policies first
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Store Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Store Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Store Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Store Logos" ON storage.objects;

-- Create very permissive policies for authenticated users
CREATE POLICY "Allow all for authenticated users" ON storage.objects
FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (true);
*/
