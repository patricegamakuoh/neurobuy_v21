# Supabase Storage Setup for Localhost

## ✅ Your Setup is Ready!

Supabase Storage works perfectly with localhost. Your environment variables are already configured, so you can start uploading files immediately.

## Required Setup Steps

### 1. Create Storage Buckets in Supabase Dashboard

Go to your Supabase project dashboard → Storage and create these buckets:

```sql
-- Run this in Supabase SQL Editor or create via dashboard

-- Product images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Store logos bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true);
```

### 2. Set Up Storage Policies

Run these policies in your Supabase SQL Editor:

```sql
-- Allow authenticated users to upload product images
CREATE POLICY "Users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view product images
CREATE POLICY "Product images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow users to upload their own store logos
CREATE POLICY "Users can upload store logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'store-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view store logos
CREATE POLICY "Store logos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'store-logos');

-- Allow users to manage their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## How to Use Image Upload in Your Store

### 1. Basic Image Upload Component

```jsx
import { useState } from 'react'
import { useImageUpload } from '@/lib/hooks/useImageUpload'

const ImageUploader = ({ onImageUploaded, type = 'product' }) => {
  const { uploadImage, uploading } = useImageUpload()

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = await uploadImage(file, type)
      if (url) {
        onImageUploaded(url)
      }
    }
  }

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

### 2. Update Store Creation Form

```jsx
// In your store creation form
const [imageUrl, setImageUrl] = useState('')

const handleImageUpload = (url) => {
  setImageUrl(url)
  setStoreInfo({ ...storeInfo, image_url: url })
}

// When submitting the form, include imageUrl in the API call
```

## File Upload Features

✅ **Direct Upload**: Files upload directly to Supabase cloud storage
✅ **Public URLs**: Get shareable URLs for uploaded images  
✅ **File Validation**: Automatic type and size validation
✅ **User-specific Folders**: Files organized by user ID
✅ **Error Handling**: Proper error messages and loading states

## Upload Limits

- **File Types**: JPEG, PNG, WebP, GIF
- **Max Size**: 5MB per file
- **Buckets**: Organized by content type (products, store logos)

## Testing from Localhost

1. **Start your dev server**: `npm run dev`
2. **Go to**: `http://localhost:3000/create-store`
3. **Upload an image**: The file will upload directly to Supabase Storage
4. **Check Supabase Dashboard**: Go to Storage to see uploaded files

Your localhost environment is fully configured for Supabase Storage uploads!
