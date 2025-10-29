# Store Rejection Handling Guide

## Overview
The system now handles store rejections gracefully, allowing users to delete rejected stores and resubmit their applications with updated information.

---

## Features

### For Users:
- ✅ Clear notification when store is rejected
- ✅ List of common rejection reasons
- ✅ Ability to delete rejected store
- ✅ Ability to resubmit application
- ✅ Support contact information

### For Admins:
- ✅ Reject stores with appropriate status
- ✅ Users can be notified about rejection
- ✅ System prevents duplicate username conflicts

---

## User Flow

### 1. Store Application Statuses

#### **Pending** (Pending Review)
- Store is awaiting admin approval
- User sees: "Your store application is pending admin review"
- User cannot resubmit or delete

#### **Approved** (Approved)
- Store has been approved by admin
- User sees: "Your store has been approved!"
- User can access store dashboard

#### **Rejected** (Rejected)
- Store has been rejected by admin
- User sees rejection message with reasons
- User can delete and resubmit

---

## Common Rejection Reasons

The system displays these common reasons for rejection:

1. **Incomplete or inaccurate business information**
2. **Inappropriate store name or description**
3. **Missing or invalid contact information**
4. **Does not meet our vendor requirements**
5. **Duplicate username or already exists**

---

## How It Works

### Step 1: User Creates Store
- User fills out store application form
- Store is created with `status: 'pending'`
- User cannot create another store while one exists

### Step 2: Admin Reviews Store
- Admin can approve or reject the store
- If rejected, store status changes to `status: 'rejected'`

### Step 3: User Sees Rejection Notification
- User visits `/create-store` page
- Sees rejection message and common reasons
- Button appears: "Delete and Resubmit Application"

### Step 4: User Resubmits
- User clicks "Delete and Resubmit Application"
- System deletes the rejected store
- User's role reverts to `CUSTOMER`
- User can now create a new store
- Form is cleared for new submission

---

## API Endpoints

### DELETE `/api/stores`
**Purpose**: Delete a rejected store

**Request**: `DELETE /api/stores`

**Authentication**: Required (Clerk)

**Response**:
```json
{
  "success": true,
  "message": "Store deleted successfully. You can now create a new store."
}
```

**Security Rules**:
- Only the store owner can delete their store
- Only rejected stores can be deleted
- Pending or approved stores cannot be deleted by users

---

## Database Schema

### Store Status Values
```sql
-- Possible status values
'pending'   -- Awaiting admin review
'approved'  -- Approved by admin
'rejected'  -- Rejected by admin
```

### Store Deletion Behavior
- When a rejected store is deleted:
  1. Store record is removed from `stores` table
  2. User's role is reverted from `VENDOR` to `CUSTOMER`
  3. All related data (cascade deletes handled by database)

---

## User Interface

### Rejection Screen Components

```jsx
// Rejection reasons box
<div className="bg-red-50 border border-red-200 rounded-lg p-6">
  <h3>Why was my application rejected?</h3>
  <ul>
    <li>Incomplete business information</li>
    <li>Inappropriate store details</li>
    <li>Missing contact information</li>
    <li>Does not meet vendor requirements</li>
    <li>Duplicate username</li>
  </ul>
  <p>Contact: support@neurobuy.com</p>
</div>

// Resubmit button
<button onClick={handleResubmit}>
  Delete and Resubmit Application
</button>
```

---

## Error Handling

### User Already Has Store
**Error**: `You already have a store. You can only create one store per account.`

**Solution**: 
- If status is `rejected`: Delete the store first
- If status is `pending` or `approved`: Contact support

### Cannot Delete Non-Rejected Store
**Error**: `Only rejected stores can be deleted.`

**Solution**: Contact support if you need to delete a pending or approved store

---

## Admin Features

### Approving Stores
```javascript
// Admin approves a store
PATCH /api/admin/stores
{
  "storeId": "uuid",
  "status": "approved"
}
```

### Rejecting Stores
```javascript
// Admin rejects a store
PATCH /api/admin/stores
{
  "storeId": "uuid",
  "status": "rejected"
}
```

---

## Future Enhancements

### Email Notifications
- [ ] Send email when store is rejected
- [ ] Include rejection reason in email
- [ ] Provide link to resubmit

### Rejection Reasons
- [ ] Admin can specify custom rejection reason
- [ ] Store rejection reason in database
- [ ] Display specific reason to user

### Appeal Process
- [ ] Allow users to appeal rejection
- [ ] Contact form for appeals
- [ ] Admin dashboard for appeals

---

## Testing Scenarios

### Test 1: Create and Reject Store
1. User creates store → status: `pending`
2. Admin rejects store → status: `rejected`
3. User sees rejection message
4. User can click "Delete and Resubmit"

### Test 2: Resubmit After Rejection
1. User clicks "Delete and Resubmit Application"
2. Rejected store is deleted
3. User role reverts to `CUSTOMER`
4. User can create new store

### Test 3: Cannot Resubmit Pending Store
1. User has pending store
2. User tries to create another store
3. Error: "You already have a store"
4. User must wait for admin decision

---

## Troubleshooting

### Problem: Button doesn't work
- **Solution**: Check browser console for errors
- **Solution**: Verify user is authenticated

### Problem: Store won't delete
- **Solution**: Check that status is exactly `'rejected'`
- **Solution**: Verify user owns the store

### Problem: Can't create after deletion
- **Solution**: Refresh the page
- **Solution**: Check database for user's store count

---

## SQL Queries

### Check Store Status
```sql
SELECT id, store_name, status, vendor_id, created_at
FROM public.stores
WHERE vendor_id = 'user-uuid';
```

### Delete Rejected Store
```sql
-- This is handled by the DELETE API endpoint
-- Manual deletion for admin:
DELETE FROM public.stores 
WHERE id = 'store-uuid' 
AND status = 'rejected';
```

### Check User's Store Status
```sql
SELECT 
  u.email,
  s.store_name,
  s.status,
  s.created_at
FROM public.users u
LEFT JOIN public.stores s ON s.vendor_id = u.id
WHERE u.email = 'user@example.com';
```

---

## Summary

### What Users Can Do:
- ✅ See clear rejection reasons
- ✅ Delete rejected stores
- ✅ Resubmit applications
- ✅ Contact support for help

### What Users Cannot Do:
- ❌ Delete pending or approved stores
- ❌ Create multiple stores
- ❌ Resubmit without deleting rejected store

### What Admins Can Do:
- ✅ Approve stores
- ✅ Reject stores
- ✅ View all store applications
- ✅ See rejection history

---

**Last Updated**: Current Date
**Status**: Store Rejection Handling Complete ✅
