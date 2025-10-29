# Admin Link Debugging Guide

## Quick Checklist

1. **Check Your Database Role**
   - Open Supabase SQL Editor
   - Run: `SELECT email, role FROM public.users;`
   - Verify your email has `role = 'ADMIN'`
   - If not, run: `UPDATE public.users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';`

2. **Check Browser Console**
   - Open browser console (F12 → Console tab)
   - Refresh the page
   - Look for these logs:
     - `ClerkNavbar - userData updated: {...}`
     - `ClerkNavbar - user role: ADMIN` (or CUSTOMER)
     - `User sync response: {...}`

3. **Check Terminal Logs**
   - Look for:
     - `Checking admin status for email: ...`
     - `User data from database: { role: 'ADMIN' }`
     - `Is admin: true`

## Common Issues and Solutions

### Issue 1: User Not in Database
**Symptom**: `ClerkNavbar - user role: undefined` or logs show "User not found in database"

**Solution**: 
1. Sign out and sign in again to trigger the sync
2. The `/api/user/sync` should create the user automatically

### Issue 2: Wrong Role in Database
**Symptom**: `ClerkNavbar - user role: CUSTOMER`

**Solution**: Update your role in Supabase:
```sql
UPDATE public.users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

### Issue 3: UserData Not Being Set
**Symptom**: No logs in browser console

**Solution**: 
1. Check that you're signed in
2. Look for any errors in browser console
3. Check network tab for failed `/api/user/sync` requests

### Issue 4: Role is ADMIN but Link Doesn't Show
**Symptom**: `user role: ADMIN` in logs but no Admin link in navbar

**Solution**: 
1. Make sure you refreshed the page after updating the role
2. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Check that the condition `{userData?.role === 'ADMIN'}` is being evaluated

## Step-by-Step Debugging

1. **Verify Database**:
   ```sql
   SELECT id, email, name, role FROM public.users WHERE email = 'your-email@gmail.com';
   ```

2. **Check Browser Console**:
   - Open Console (F12)
   - Look for: `ClerkNavbar - userData updated: {...}`
   - Note the `role` value

3. **Check Network Tab**:
   - Open Network tab (F12 → Network)
   - Find the `/api/user/sync` request
   - Check the response
   - Look for `{ user: { role: "ADMIN" } }`

4. **Refresh and Test**:
   - Sign out completely
   - Sign in again
   - Refresh the page
   - Check if Admin link appears

## Quick Test

Run this in your browser console after signing in:
```javascript
// This will show you what's in userData
// (You'll need to add this temporarily to ClerkNavbar.jsx)
```

## Expected Console Output

When working correctly, you should see:
```
ClerkNavbar - userData updated: { id: "...", email: "...", role: "ADMIN", ... }
ClerkNavbar - user role: ADMIN
User sync response: { user: { id: "...", email: "...", role: "ADMIN", ... } }
```

## Still Not Working?

If none of these work, please share:
1. The output from `SELECT email, role FROM public.users;`
2. The browser console logs
3. The terminal logs when accessing `/admin`
