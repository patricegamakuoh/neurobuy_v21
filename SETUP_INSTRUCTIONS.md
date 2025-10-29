# Clerk + Supabase Integration Setup Guide

## 🎯 Overview
This project uses **Clerk** for authentication and **Supabase** as the backend database. Clerk handles all authentication logic while Supabase stores your business data.

## ✅ Advantages
- ✅ **Clerk handles authentication** - Email, Google, social logins, MFA, passwordless
- ✅ **Supabase stores your data** - Products, orders, stores, etc.
- ✅ **No database connection needed for auth** - Works even if database is down
- ✅ **Smooth integration** - Clerk users automatically sync to Supabase

## 📋 Setup Steps

### Step 1: Create Clerk Account
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for free (10,000 monthly active users included!)
3. Create a new application
4. Copy your API keys

### Step 2: Add Clerk Environment Variables
Add these to your `.env.local` file:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Keep your existing Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://fnxgmdziapxxeawbejiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres:password@db.fnxgmdziapxxeawbejiz.supabase.co:5432/postgres
```

### Step 3: Configure Clerk Application
1. In Clerk Dashboard → Application Settings
2. Enable Email & Password authentication
3. Configure OAuth providers (optional): Google, GitHub, etc.
4. Set callback URLs:
   - Sign-in URL: `http://localhost:3000/sign-in`
   - Sign-up URL: `http://localhost:3000/sign-up`
   - After sign-in URL: `http://localhost:3000`
   - After sign-up URL: `http://localhost:3000`

### Step 4: Update Database Schema
Run this Prisma migration to update your database:

```bash
npx prisma db push
```

This ensures your database can store Clerk user IDs.

### Step 5: Test the Integration
1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/sign-in`
3. Create an account with Clerk
4. The user will automatically sync with your Supabase database

## 🔧 How It Works

### Authentication Flow:
1. User signs in with Clerk (email, Google, etc.)
2. Clerk validates credentials and creates session
3. On successful login, app calls `/api/user/sync`
4. API route creates/updates user in Supabase database
5. User data is stored in Supabase for your e-commerce features

### Benefits:
- ✅ Authentication works independently of database
- ✅ Users sync automatically to Supabase
- ✅ Business logic (orders, stores, products) stored in Supabase
- ✅ Best of both worlds: Clerk's auth + Supabase's database

## 🚀 Next Steps
1. Add your Clerk API keys to `.env.local`
2. Update your navbar to use `ClerkNavbar` component
3. Test the sign-in/sign-up flow
4. Verify users are syncing to Supabase database

## 📚 Resources
- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
- Support: Check your Clerk dashboard for troubleshooting
