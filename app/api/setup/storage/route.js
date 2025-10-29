import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Setting up Supabase Storage buckets...')
    
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const results = []

    // Create product-images bucket
    try {
      const { data: productBucket, error: productError } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      })
      
      if (productError && !productError.message.includes('already exists')) {
        console.error('Product bucket creation error:', productError)
        results.push({ bucket: 'product-images', error: productError.message })
      } else {
        results.push({ bucket: 'product-images', success: true })
      }
    } catch (err) {
      results.push({ bucket: 'product-images', error: err.message })
    }

    // Create store-logos bucket
    try {
      const { data: storeBucket, error: storeError } = await supabase.storage.createBucket('store-logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      })
      
      if (storeError && !storeError.message.includes('already exists')) {
        console.error('Store bucket creation error:', storeError)
        results.push({ bucket: 'store-logos', error: storeError.message })
      } else {
        results.push({ bucket: 'store-logos', success: true })
      }
    } catch (err) {
      results.push({ bucket: 'store-logos', error: err.message })
    }

    // Try to create RLS policies (this might fail if not admin, but that's ok)
    try {
      // Note: Creating policies via API is complex, so we'll provide instructions instead
      console.log('Storage buckets created. RLS policies need to be set up manually.')
    } catch (policyError) {
      console.log('Policy creation skipped:', policyError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Storage setup completed. You may need to set up RLS policies manually.',
      results,
      nextSteps: [
        'Go to Supabase Dashboard > Storage > Policies',
        'Create policies for both buckets to allow authenticated uploads',
        'Or run the SQL script in scripts/setup-storage.sql'
      ]
    })

  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json(
      { error: `Storage setup failed: ${error.message}` },
      { status: 500 }
    )
  }
}
