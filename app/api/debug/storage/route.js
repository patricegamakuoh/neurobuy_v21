import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing Supabase Storage...')
    
    const supabase = await createClient()
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Buckets test:', { buckets: buckets?.map(b => b.name), error: bucketsError?.message })
    
    // Test 2: Check if product-images bucket exists
    const productImagesBucket = buckets?.find(b => b.name === 'product-images')
    console.log('Product images bucket:', productImagesBucket)
    
    // Test 3: Check if store-logos bucket exists
    const storeLogosBucket = buckets?.find(b => b.name === 'store-logos')
    console.log('Store logos bucket:', storeLogosBucket)
    
    // Test 4: Try to list files in product-images bucket (if it exists)
    let productImagesFiles = null
    let productImagesError = null
    if (productImagesBucket) {
      const { data: files, error } = await supabase.storage
        .from('product-images')
        .list('products', { limit: 1 })
      productImagesFiles = files
      productImagesError = error
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        buckets: { 
          list: buckets?.map(b => ({ name: b.name, public: b.public })), 
          error: bucketsError?.message 
        },
        productImagesBucket: productImagesBucket ? {
          name: productImagesBucket.name,
          public: productImagesBucket.public,
          files: productImagesFiles,
          error: productImagesError?.message
        } : null,
        storeLogosBucket: storeLogosBucket ? {
          name: storeLogosBucket.name,
          public: storeLogosBucket.public
        } : null
      }
    })
    
  } catch (error) {
    console.error('Storage debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
