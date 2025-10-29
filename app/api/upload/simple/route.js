import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get user details
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Create Supabase client with service role for storage operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type') || 'product'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Determine bucket based on type
    const bucket = type === 'product' ? 'product-images' : 'store-logos'
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${type}s/${userId}/${fileName}`

    console.log('Attempting upload to:', { bucket, filePath, fileName })

    // Try to upload using the admin client approach
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload using admin client
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (error) {
        console.error('Upload error:', error)
        
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found')) {
          console.log('Bucket not found, attempting to create:', bucket)
          
          const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: allowedTypes
          })
          
          if (bucketError) {
            console.error('Failed to create bucket:', bucketError)
            return NextResponse.json(
              { error: `Failed to create bucket: ${bucketError.message}` },
              { status: 500 }
            )
          }
          
          // Retry upload after creating bucket
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            })
          
          if (retryError) {
            console.error('Retry upload error:', retryError)
            return NextResponse.json(
              { error: `Upload failed after bucket creation: ${retryError.message}` },
              { status: 500 }
            )
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)
          
          return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: fileName
          })
        }
        
        return NextResponse.json(
          { error: `Upload failed: ${error.message}` },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: fileName
      })

    } catch (uploadError) {
      console.error('Upload exception:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
