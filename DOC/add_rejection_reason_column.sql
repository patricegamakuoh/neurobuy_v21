-- Add rejection_reason column to stores table
-- Run this in Supabase SQL Editor

ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'stores' 
AND column_name = 'rejection_reason';
