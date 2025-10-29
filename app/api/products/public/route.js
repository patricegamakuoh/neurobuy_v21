import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all active products (simplified for now)
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Public products fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Add store information for each product
    const productsWithStores = await Promise.all(
      products.map(async (product) => {
        if (product.vendorId) {
          // Fetch store information for this vendor
          const { data: store } = await supabase
            .from('stores')
            .select('store_name, image_url')
            .eq('vendor_id', product.vendorId)
            .eq('status', 'approved')
            .single()

          return {
            ...product,
            store: store ? {
              name: store.store_name,
              logo: store.image_url || '/placeholder-store-logo.svg',
              username: store.store_name?.toLowerCase().replace(/\s+/g, '-') || 'store'
            } : {
              name: 'Our Store',
              logo: '/placeholder-store-logo.svg',
              username: 'store'
            }
          }
        }
        return {
          ...product,
          store: {
            name: 'Our Store',
            logo: '/placeholder-store-logo.svg',
            username: 'store'
          }
        }
      })
    )

    return NextResponse.json({ products: productsWithStores })
  } catch (error) {
    console.error('Public products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


