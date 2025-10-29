import { createClient } from './client'

export const uploadFile = async (file, bucket, folder = '') => {
  const supabase = createClient()
  
  try {
    // Generate unique filename to avoid conflicts
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      path: data.path,
      publicUrl: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const deleteFile = async (bucket, filePath) => {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Upload store logo
export const uploadStoreLogo = async (file) => {
  return await uploadFile(file, 'store-logos', 'logos')
}

// Upload product images
export const uploadProductImage = async (file) => {
  return await uploadFile(file, 'product-images', 'products')
}

// Upload multiple product images
export const uploadMultipleProductImages = async (files) => {
  const uploadPromises = files.map(file => uploadProductImage(file))
  const results = await Promise.all(uploadPromises)
  
  return {
    success: results.every(r => r.success),
    results: results,
    urls: results.filter(r => r.success).map(r => r.publicUrl)
  }
}
