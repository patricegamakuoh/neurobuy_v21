import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { image_url } = body

    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', user.id)
      .single()

    if (storeError) {
      console.error('Store fetch error:', storeError)
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Update store logo
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({ image_url: image_url })
      .eq('vendor_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Store logo update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update store logo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Store logo updated successfully',
      store: updatedStore
    })

  } catch (error) {
    console.error('Store logo update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
