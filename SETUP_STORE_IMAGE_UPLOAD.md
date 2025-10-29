# Setup Store Image Upload with Supabase

## Step 1: Create Storage Bucket in Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **Create bucket** OR run the SQL script below
5. Run the SQL from `DOC/setup_supabase_storage.sql` in the SQL Editor

OR manually create:
- Bucket name: `store-images`
- Public bucket: **Yes** (checked)
- Allowed MIME types: `image/*`

## Step 2: Test the Upload

1. Go to your app at `http://localhost:3000/create-store`
2. Fill in the store details
3. Click "Choose file" and select an image
4. Submit the form
5. The image should upload to Supabase Storage

## Step 3: Verify

After creating a store with an image:
1. Go to Supabase Dashboard → Storage
2. Click on the `store-images` bucket
3. You should see the uploaded image there

## How It Works

1. User selects an image on the create-store page
2. When the form is submitted, the image is uploaded to Supabase Storage
3. Supabase returns a public URL for the image
4. The URL is saved in the database when creating the store
5. Admin panel displays the image using this URL

## Troubleshooting

**Issue**: Upload fails with "Forbidden" error
- **Solution**: Make sure you ran the SQL script to set up storage policies

**Issue**: Image doesn't appear in admin panel
- **Solution**: Check that the bucket is public and the policies are correct

**Issue**: "Storage bucket not found"
- **Solution**: Create the bucket in Supabase Dashboard first
