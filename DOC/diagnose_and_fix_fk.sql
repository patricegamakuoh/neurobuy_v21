-- Diagnose and fix foreign key constraint issue
-- Run this in Supabase SQL Editor

-- STEP 1: Check current foreign key
SELECT 
    'Current Foreign Key Constraint:' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'stores'
  AND kcu.column_name = 'vendor_id';

-- STEP 2: Check if user exists in public.users
SELECT 
    'Checking if user exists in public.users:' as info,
    id,
    email,
    name,
    role
FROM public.users 
WHERE id = 'be973f89-2b39-4c7d-86f3-6e112486f6e2';

-- STEP 3: Check if user exists in auth.users (just to compare)
SELECT 
    'Checking if user exists in auth.users:' as info,
    id,
    email
FROM auth.users 
WHERE id = 'be973f89-2b39-4c7d-86f3-6e112486f6e2' LIMIT 1;

-- STEP 4: Drop the problematic foreign key
ALTER TABLE public.stores 
DROP CONSTRAINT IF EXISTS stores_vendor_id_fkey;

-- STEP 5: Recreate the foreign key pointing to public.users
ALTER TABLE public.stores
ADD CONSTRAINT stores_vendor_id_fkey 
FOREIGN KEY (vendor_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- STEP 6: Verify the new constraint
SELECT 
    'New Foreign Key Constraint (should point to public.users):' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'stores'
  AND kcu.column_name = 'vendor_id';
