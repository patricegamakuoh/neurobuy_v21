# Steps to Fix Rejection Reason Feature

## Problem
The `rejectionReason` field is not being recognized by Prisma because the client wasn't regenerated after adding the field to the schema.

## Solution

### Step 1: Run SQL in Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste this SQL:

```sql
-- Add rejection_reason column to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
```

6. Click **Run** (or press Ctrl+Enter)

### Step 2: Stop Your Development Server
Press `Ctrl+C` in the terminal where your Next.js server is running

### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 4: Restart Your Development Server
```bash
npm run dev
```

### Step 5: Test the Feature
1. Go to `/admin/stores`
2. Click "Reject" on a pending store
3. Enter a rejection reason
4. Click "Confirm Rejection"
5. The store should be rejected with the reason saved

## Verification
After completing these steps, try rejecting a store again. The error should be gone and the rejection reason should be saved to the database.
