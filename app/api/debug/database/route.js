import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test Supabase connection
    const supabase = await createClient()
    
    // Test 1: Check if we can connect to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth test:', { user: user?.id, error: authError?.message })
    
    // Test 2: Check if we can query the stores table
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, status')
      .limit(1)
    console.log('Stores test:', { count: stores?.length, error: storesError?.message })
    
    // Test 3: Check if we can query the products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)
    console.log('Products test:', { count: products?.length, error: productsError?.message })
    
    // Test 4: Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
    console.log('Environment check:', envCheck)
    
    return NextResponse.json({
      success: true,
      tests: {
        auth: { user: user?.id, error: authError?.message },
        stores: { count: stores?.length, error: storesError?.message },
        products: { count: products?.length, error: productsError?.message },
        environment: envCheck
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
