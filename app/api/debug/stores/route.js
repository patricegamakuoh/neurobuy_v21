import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', authError: authError?.message },
        { status: 401 }
      )
    }

    console.log('Debug: User ID:', user.id)

    // Get user's store
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', user.id)
      .single()

    console.log('Debug: Store data:', store)
    console.log('Debug: Store error:', error)

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Store fetch error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch store data',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      store,
      user: { id: user.id, email: user.email },
      hasStore: !!store,
      storeStatus: store?.status
    })

  } catch (error) {
    console.error('Store debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
