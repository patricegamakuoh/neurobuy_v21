-- Logistics Provider System Schema Setup
-- This script creates all necessary tables for the logistics service functionality

-- 1. Create logistics_providers table
CREATE TABLE IF NOT EXISTS public.logistics_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    regions JSONB NOT NULL,
    pricing JSONB,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add indexes for logistics_providers
CREATE INDEX IF NOT EXISTS idx_logistics_providers_provider_id ON public.logistics_providers(provider_id);
CREATE INDEX IF NOT EXISTS idx_logistics_providers_status ON public.logistics_providers(status);

-- 3. Create delivery_requests table for seller logistics requests
CREATE TABLE IF NOT EXISTS public.delivery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    provider_id UUID,
    pickup_date TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,
    quotation JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add indexes for delivery_requests
CREATE INDEX IF NOT EXISTS idx_delivery_requests_order_id ON public.delivery_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_seller_id ON public.delivery_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_provider_id ON public.delivery_requests(provider_id);

-- 5. Update shipments table with new tracking fields
ALTER TABLE IF EXISTS public.shipments
    ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'pending_pickup',
    ADD COLUMN IF NOT EXISTS pickup_location TEXT,
    ADD COLUMN IF NOT EXISTS delivery_address TEXT,
    ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS actual_delivery TIMESTAMPTZ;

-- 6. Create shipment_tracking table for detailed progress tracking
CREATE TABLE IF NOT EXISTS public.shipment_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Add indexes for shipment_tracking
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment_id ON public.shipment_tracking(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_status ON public.shipment_tracking(status);

-- 8. Add index for shipments tracking number
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);

-- Verification queries
SELECT 'Logistics Providers Table' as table_name, count(*) as row_count FROM public.logistics_providers
UNION ALL
SELECT 'Delivery Requests Table', count(*) FROM public.delivery_requests
UNION ALL
SELECT 'Shipment Tracking Table', count(*) FROM public.shipment_tracking;
