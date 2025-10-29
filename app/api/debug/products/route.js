import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debug: Checking products in database...')
    
    const supabase = await createClient()
    
    // Check all products (regardless of status)
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('Error fetching all products:', allError)
      return NextResponse.json({
        error: 'Failed to fetch products',
        details: allError.message
      }, { status: 500 })
    }

    // Check active products only
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (activeError) {
      console.error('Error fetching active products:', activeError)
    }

    // Check stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false })

    if (storesError) {
      console.error('Error fetching stores:', storesError)
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: allProducts?.length || 0,
        activeProducts: activeProducts?.length || 0,
        totalStores: stores?.length || 0
      },
      allProducts: allProducts || [],
      activeProducts: activeProducts || [],
      stores: stores || [],
      errors: {
        allProducts: allError?.message,
        activeProducts: activeError?.message,
        stores: storesError?.message
      }
    })
    
  } catch (error) {
    console.error('Debug products error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
