-- Add missing fields to stores table to support store creation form
-- Run this SQL on your Supabase database to add the missing columns

-- Add missing columns to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS contact text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update the description to be more comprehensive
COMMENT ON COLUMN public.stores.description IS 'Full store description including business details';
COMMENT ON COLUMN public.stores.username IS 'Unique store username for URL/findability';
COMMENT ON COLUMN public.stores.email IS 'Store contact email';
COMMENT ON COLUMN public.stores.contact IS 'Store contact phone number';
COMMENT ON COLUMN public.stores.address IS 'Store physical address';
COMMENT ON COLUMN public.stores.image_url IS 'Store logo/image URL';
COMMENT ON COLUMN public.stores.status IS 'Store status: pending, approved, rejected';

-- Add index for username lookup
CREATE INDEX IF NOT EXISTS idx_stores_username ON public.stores(username);

-- Update policies if needed (they should already cover the new columns)
-- The existing policy "Vendors can manage own stores" should work for all columns
