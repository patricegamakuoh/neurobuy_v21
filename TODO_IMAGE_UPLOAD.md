# TODO: Store Logo Image Upload

## Current Issue
Store logos are not being uploaded when users create stores. The `image` field is set to `null` in the create-store form.

## What Needs to Be Done

### 1. Choose an Image Storage Service
Options:
- **Supabase Storage** (Recommended - already using Supabase)
- **Cloudinary** (Easy to implement)
- **AWS S3** (More complex setup)

### 2. Implement Image Upload
Create an API route to handle image uploads: `/api/upload/store-image`

### 3. Update Create Store Form
Modify `app/(public)/create-store/page.jsx` to:
- Upload image to storage service
- Get the image URL
- Send URL to store creation API

### 4. Update API
Modify `app/api/stores/route.js` to save the image URL

## Quick Fix for Now
The admin panel already shows "No logo" when there's no image, which works for now. Users can create stores without logos.
