# Supabase Database Setup Guide

## 🚀 How to Apply the Schema to Your Supabase Database

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"** to create a new SQL script

### Step 2: Apply the Schema
1. Copy the entire content from `DOC/supabase_schema.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the schema

### Step 3: Verify Tables Created
The following tables should be created:
- `public.users` - Extended user profiles
- `public.stores` - Vendor stores
- `public.products` - Product catalog
- `public.addresses` - User addresses
- `public.orders` - Customer orders
- `public.order_items` - Order line items
- `public.logistics` - Logistics providers
- `public.shipments` - Shipment tracking
- `public.payments` - Payment records
- `public.coupons` - Discount coupons
- `public.ratings` - Product ratings

### Step 4: Test Authentication Flow
1. Try signing up a new user
2. Check if a record appears in `public.users` table
3. Verify RLS policies are working

### Step 5: Update Environment Variables
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
```

### 🔧 Troubleshooting

**If you get permission errors:**
- Make sure you're using the correct database connection string
- Verify Row Level Security (RLS) policies are correctly set

**If tables already exist:**
- The schema uses `create table if not exists` so it won't duplicate
- You can manually drop tables if needed and re-run

**If authentication flow breaks:**
- Check the `handle_new_user()` function and trigger
- Verify the function has proper permissions

### 📊 Schema Features

**Security:**
- Row Level Security enabled on all tables
- User-specific policies for data access
- Vendor-specific policies for store/product management

**Performance:**
- Indexes on frequently queried columns
- Optimized foreign key relationships

**Automation:**
- Auto-creation of user profiles on signup
- Proper cascade deletes for data integrity
