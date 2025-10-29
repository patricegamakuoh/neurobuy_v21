# Admin Store Approval Setup Guide

## What's Been Created

✅ **Complete Store Approval System** - Your store creation now works with admin approval workflow!

### New Features:

1. **Admin API Endpoints**:
   - `GET /api/admin/stores` - Fetch all stores (filterable by status)
   - `PATCH /api/admin/stores` - Approve/reject stores
   - `GET /api/admin/check` - Check if user is admin

2. **Admin Interface**: 
   - Updated admin stores page with tabs (Pending, Approved, Rejected, All)
   - Approve/Reject buttons for pending applications
   - Real-time status updates

3. **Store Status Flow**:
   - `pending` → Created, waiting for review
   - `approved` → Store can start selling
   - `rejected` → Store application denied

## How to Approve Stores as Admin

### Step 1: Set Up Admin User

You need to set a user's role to 'ADMIN' in the database:

```sql
-- Run this in your Supabase SQL Editor to make a user admin
-- Replace 'user-email@example.com' with the actual user's email

UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'user-email@example.com';
```

### Step 2: Access Admin Dashboard

1. **Login** with the admin user account
2. **Navigate** to `/admin/stores` 
3. **View** the "Pending Review" tab to see new store applications

### Step 3: Approve/Reject Stores

For each pending store application, you can:
- **Click "Approve Store"** → Store becomes active, user role changes to VENDOR
- **Click "Reject"** → Store application is denied

## Admin Features

### Store Management Tabs:
- **Pending Review** - New applications waiting for approval
- **Approved** - Active stores that can sell products  
- **Rejected** - Denied applications
- **All Stores** - Complete list of all stores

### Actions Available:
- **Approve** pending stores
- **Reject** pending stores  
- **Revoke** approval from approved stores
- **Re-approve** previously rejected stores

## User Experience After Approval

When a store is approved:
1. ✅ Store status changes to `approved`
2. ✅ User role changes to `VENDOR` 
3. ✅ User can access their store dashboard
4. ✅ User can start adding products

The store creation form will show the appropriate status to users based on the approval state.
