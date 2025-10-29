# Admin Access Setup for Clerk Authentication

## How to Grant Admin Access After Signing In

Since you're using **Clerk** for authentication, you need to manually set your user role to `ADMIN` in the Supabase database.

## Step-by-Step Instructions

### Step 1: Find Your User Email
After signing in with Clerk, note your email address (e.g., `kuohpatrice@gmail.com` or `patricegama4@gmail.com`)

### Step 2: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 3: Run This SQL Query

Replace `kuohpatrice@gmail.com` with your actual email address:

```sql
-- Update your user role to ADMIN
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'kuohpatrice@gmail.com';
```

### Step 4: Verify the Update

Check that your role was updated:

```sql
-- Check your current role
SELECT id, email, role, name 
FROM public.users 
WHERE email = 'kuohpatrice@gmail.com';
```

You should see `role: ADMIN` in the results.

### Step 5: Refresh Your App

1. Go back to your app at `http://localhost:3000`
2. Refresh the page (or sign out and sign in again)
3. You should now see an "Admin" link with a shield icon in the navbar
4. Click it to access the admin dashboard

## Admin Features

Once you have admin access, you can:
- ✅ Access the admin dashboard at `/admin`
- ✅ Approve or reject store applications at `/admin/stores`
- ✅ Manage coupons at `/admin/coupons`
- ✅ View and manage all users and stores
- ✅ See administrative statistics and reports

## Current Admin Users

Based on your database:
- **kuohpatrice@gmail.com** - Role: ADMIN
- **patricegama4@gmail.com** - Role: CUSTOMER

To make the second user an admin, run:
```sql
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'patricegama4@gmail.com';
```

## Troubleshooting

**Problem**: Admin link doesn't appear in navbar
- **Solution**: Make sure you refreshed the page after updating the role
- **Solution**: Sign out and sign in again to reload user data

**Problem**: Can't access `/admin` page
- **Solution**: Check that your role is exactly `ADMIN` (case-sensitive)
- **Solution**: Check browser console for errors

**Problem**: Getting 401 Unauthorized
- **Solution**: The admin check API might be failing. Check terminal logs
- **Solution**: Verify that your user exists in the `users` table

## Quick Reference

```sql
-- Make any user an admin
UPDATE public.users SET role = 'ADMIN' WHERE email = 'user@example.com';

-- Check all admins
SELECT email, name, role FROM public.users WHERE role = 'ADMIN';

-- Remove admin access
UPDATE public.users SET role = 'CUSTOMER' WHERE email = 'user@example.com';

-- Check a specific user's role
SELECT email, role FROM public.users WHERE email = 'user@example.com';
```
