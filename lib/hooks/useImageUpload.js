import { useState } from 'react'
import toast from 'react-hot-toast'

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)

  const uploadImage = async (file, type = 'product') => {
    if (!file) return null

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUploadedUrl(data.url)
        toast.success('Image uploaded successfully!')
        return data.url
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadImage,
    uploading,
    uploadedUrl,
    setUploadedUrl
  }
}
