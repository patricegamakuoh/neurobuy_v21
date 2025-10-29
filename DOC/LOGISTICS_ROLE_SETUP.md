# Logistics Role Setup Guide

## Overview
The LOGISTICS role is now available in the NeuroBuy system. Users with this role have access to logistics services and can manage shipping and delivery operations.

---

## Features for LOGISTICS Users

### What LOGISTICS Users Can Do:
- ✅ Access "My Services" link in the navbar
- ✅ View logistics service page at `/logistics-service`
- ✅ Browse available logistics providers
- ✅ Connect with logistics partners
- ✅ Manage delivery operations (future feature)

---

## How to Grant LOGISTICS Role

### Step 1: Find the User Email
After signing in with Clerk, note the user's email address (e.g., `logistics@example.com`)

### Step 2: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 3: Update User Role to LOGISTICS

Replace `logistics@example.com` with the actual email address:

```sql
-- Update user role to LOGISTICS
UPDATE public.users 
SET role = 'LOGISTICS' 
WHERE email = 'logistics@example.com';
```

### Step 4: Verify the Update

Check that the role was updated:

```sql
-- Check the updated role
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'logistics@example.com';
```

You should see `role: LOGISTICS` in the results.

### Step 5: Refresh Your App

1. Go back to your app at `http://localhost:3000`
2. Refresh the page (or sign out and sign in again)
3. You should now see a "My Services" link in the navbar
4. Click it to access logistics services

---

## Role-Based Navigation

### For LOGISTICS Users:
- **My Services** - Access logistics services and manage delivery operations

### For Other Users (Customer/Vendor):
- **Logistics** - Browse available logistics providers

---

## Available Roles in NeuroBuy

| Role | Description | Access |
|------|-------------|--------|
| `CUSTOMER` | Default role for shoppers | Browse products, add to cart, place orders |
| `VENDOR` | Store owners and sellers | Manage stores, products, orders |
| `LOGISTICS` | Delivery and shipping providers | Manage logistics services, deliveries |
| `ADMIN` | Platform administrators | Full system access, approve stores |

---

## Quick Reference Commands

```sql
-- Grant LOGISTICS role to a user
UPDATE public.users SET role = 'LOGISTICS' WHERE email = 'user@example.com';

-- Check all logistics users
SELECT email, name, role FROM public.users WHERE role = 'LOGISTICS';

-- Check a specific user's role
SELECT email, role FROM public.users WHERE email = 'user@example.com';

-- Remove LOGISTICS role (revert to CUSTOMER)
UPDATE public.users SET role = 'CUSTOMER' WHERE email = 'user@example.com';

-- List all users and their roles
SELECT email, name, role FROM public.users ORDER BY role;
```

---

## Troubleshooting

### Problem: "My Services" link doesn't appear
- **Solution**: Make sure you refreshed the page after updating the role
- **Solution**: Sign out and sign in again to reload user data

### Problem: Can't access `/logistics-service` page
- **Solution**: Check that your role is exactly `LOGISTICS` (case-sensitive)
- **Solution**: Check browser console for errors

### Problem: Getting 401 Unauthorized
- **Solution**: The user might not be authenticated with Clerk
- **Solution**: Check that the user exists in the `users` table

---

## Integration with Current System

### User Flow:
1. User signs up/up with Clerk
2. User gets synced to Supabase with `CUSTOMER` role by default
3. Admin updates role to `LOGISTICS` in database
4. User refreshes page and sees "My Services" link
5. User can access logistics service page

### Current Navbar Behavior:
- **LOGISTICS role**: Shows "My Services" link → `/logistics-service`
- **Other roles**: Shows "Logistics" link → `/logistics` (browse providers)

---

## Future Enhancements

Potential features for LOGISTICS users:
- [ ] Dashboard for managing deliveries
- [ ] Shipment tracking
- [ ] Delivery notifications
- [ ] Pricing management
- [ ] Route optimization
- [ ] Fleet management

---

## Database Schema

The `role` field in the `users` table supports:
- `CUSTOMER` (default)
- `VENDOR`
- `LOGISTICS`
- `ADMIN`

All roles are stored as strings in the `public.users.role` column.

---

**Last Updated**: Current Date
**Status**: LOGISTICS Role Ready ✅
