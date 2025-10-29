# How to Access Admin Dashboard

## Issue: Can't Find Admin Dashboard

The admin dashboard exists at `/admin` but you need proper access. Here are the solutions:

## Solution 1: Direct URL Access (Quick Test)
Open these URLs directly in your browser:
- `http://localhost:3000/admin` - Main dashboard
- `http://localhost:3000/admin/stores` - Store management

## Solution 2: Set Up Admin Access

### Step 1: Make Yourself Admin
Run this SQL in your Supabase SQL Editor:

```sql
-- Replace with your actual email address
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';

-- If you don't have a users record yet, create one:
INSERT INTO public.users (id, email, role)
SELECT auth.uid(), auth.email(), 'ADMIN'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid()
);
```

### Step 2: Login and Check
1. Login with your account
2. The navbar should now show an "Admin" link with a shield icon
3. Click it to access the dashboard

## Solution 3: Check Current User Role

If you're still having issues, check your current role:

```sql
-- Check your current user data
SELECT id, email, role FROM public.users 
WHERE email = 'your-email@example.com';
```

## Admin Dashboard Features

Once you access `/admin/stores`, you'll see:
- **Pending Review** tab with new store applications
- **Approve/Reject** buttons for each store
- **Approved/Rejected** status tabs
- Real-time updates when you approve stores

## Troubleshooting

If the admin dashboard still doesn't work:
1. Check browser console for errors
2. Verify you're logged in
3. Make sure your user role is set to 'ADMIN' in database
4. Try refreshing the page after setting admin role
