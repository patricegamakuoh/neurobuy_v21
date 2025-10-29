-- Add mrp column to products table
-- Run this in Supabase SQL Editor

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS mrp BIGINT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name = 'mrp';
