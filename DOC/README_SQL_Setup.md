# How to Run SQL on Supabase Database

## Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema Update**
   - Copy the contents from `stores_schema_update.sql`
   - Paste it into the SQL editor
   - Click "Run" button

## Method 2: Using Supabase CLI

1. **Install Supabase CLI** (if not installed)
   ```bash
   npm install -g @supabase/cli
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Run the SQL**
   ```bash
   supabase db reset --file DOC/stores_schema_update.sql
   ```

## Method 3: Direct Database Connection

1. **Get your database connection details**
   - Go to Settings > Database in Supabase Dashboard
   - Use the connection string or individual parameters

2. **Connect with psql or your preferred SQL client**
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Run the SQL**
   ```sql
   \i DOC/stores_schema_update.sql
   ```

## What the Update Does

The `stores_schema_update.sql` adds these missing columns to your `stores` table:
- `username` (text, unique)
- `email` (text)  
- `contact` (text)
- `address` (text)
- `image_url` (text)
- `status` (text, default 'pending')

This enables the store creation form to work properly!
