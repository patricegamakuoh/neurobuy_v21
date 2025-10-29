-- Add missing fields to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS username VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS contact VARCHAR,
ADD COLUMN IF NOT EXISTS address VARCHAR,
ADD COLUMN IF NOT EXISTS image_url VARCHAR,
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';

-- Update existing stores to have approved status if they don't have status set
UPDATE public.stores 
SET status = 'approved' 
WHERE status IS NULL;

-- Add comment for the status field
COMMENT ON COLUMN public.stores.status IS 'Store status: pending, approved, rejected';
