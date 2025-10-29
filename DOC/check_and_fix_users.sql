-- Check and fix users table for Clerk integration
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT 
    'Current users table structure:' as info;
    
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Check for foreign key constraints
SELECT 
    'Foreign key constraints:' as info;
    
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'users';

-- Step 3: Drop the foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint users_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint users_id_fkey does not exist';
    END IF;
END $$;

-- Step 4: Drop triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 5: Ensure email can be null
ALTER TABLE public.users 
ALTER COLUMN email DROP NOT NULL;

-- Step 6: Ensure id has default UUID generation
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 7: Show final structure
SELECT 
    'Final users table structure:' as info;
    
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
