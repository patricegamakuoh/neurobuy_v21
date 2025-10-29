-- Manual user fix for patricegama4@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Check if the user exists
SELECT id, email, name, role, created_at 
FROM public.users 
WHERE email = 'patricegama4@gmail.com';

-- Step 2: If the user doesn't exist, create it
INSERT INTO public.users (email, name, role)
VALUES ('patricegama4@gmail.com', 'Patrice Gama', 'CUSTOMER')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Verify the user was created/updated
SELECT id, email, name, role, created_at 
FROM public.users 
WHERE email = 'patricegama4@gmail.com';
