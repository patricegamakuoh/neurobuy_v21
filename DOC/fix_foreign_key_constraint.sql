-- Fix foreign key constraint for Clerk integration
-- Run this in Supabase SQL Editor

-- First, check if the constraint exists
-- If users_id_fkey exists, drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint users_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint users_id_fkey does not exist';
    END IF;
END $$;

-- Also drop any trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure the id column has the correct default value
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Drop and recreate the id column if it doesn't have the default
DO $$ 
BEGIN
    -- Check if the default constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_attrdef 
        WHERE adrelid = 'public.users'::regclass 
        AND adnum = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.users'::regclass AND attname = 'id')
        AND pg_get_expr(adbin, adrelid) = 'gen_random_uuid()'
    ) THEN
        -- Recreate the column with the default
        ALTER TABLE public.users 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'Added default UUID generation to id column';
    ELSE
        RAISE NOTICE 'id column already has correct default';
    END IF;
END $$;

-- Verify the users table has the correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
