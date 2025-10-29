-- Update store status to 'rejected' for testing rejection flow
-- Run this in Supabase SQL Editor

-- Update the store status to 'rejected'
UPDATE public.stores 
SET status = 'rejected' 
WHERE vendor_id = (
    SELECT id FROM public.users WHERE email = 'patricegama4@gmail.com'
);

-- Verify the update
SELECT 
    s.id,
    s.store_name,
    s.status,
    s.vendor_id,
    u.email,
    s.created_at
FROM public.stores s
JOIN public.users u ON s.vendor_id = u.id
WHERE u.email = 'patricegama4@gmail.com';

-- Expected result:
-- status should be 'rejected'
