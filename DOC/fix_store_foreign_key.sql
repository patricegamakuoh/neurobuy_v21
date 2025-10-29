-- Fix store foreign key constraint issue
-- Run this in Supabase SQL Editor

-- Step 1: Check if the user exists
SELECT 'Checking if user exists...' as info;
SELECT id, email, name, role 
FROM public.users 
WHERE id = 'be973f89-2b39-4c7d-86f3-6e112486f6e2';

-- Step 2: Check the foreign key constraint
SELECT 'Checking foreign key constraint...' as info;
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'stores'
  AND kcu.column_name = 'vendor_id';

-- Step 3: Drop and recreate the foreign key if needed
DO $$ 
BEGIN
    -- Drop the existing foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stores_vendor_id_fkey' 
        AND table_name = 'stores'
    ) THEN
        ALTER TABLE public.stores DROP CONSTRAINT stores_vendor_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint stores_vendor_id_fkey';
    END IF;

    -- Recreate the foreign key
    ALTER TABLE public.stores
    ADD CONSTRAINT stores_vendor_id_fkey 
    FOREIGN KEY (vendor_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Created foreign key constraint stores_vendor_id_fkey';
END $$;

-- Step 4: Verify the constraint
SELECT 'Verifying constraint...' as info;
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'stores'
  AND kcu.column_name = 'vendor_id';
