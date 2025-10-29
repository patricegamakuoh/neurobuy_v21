-- Fix products table by adding mrp column
-- Run this in Supabase SQL Editor

-- Check current structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Add mrp column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS mrp BIGINT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;
