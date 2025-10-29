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
    const { store_name, description, email, contact, address } = body

    // Validate required fields
    if (!store_name || !store_name.trim()) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    // Get user's store to check if it exists
    const { data: existingStore, error: storeError } = await supabase
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

    // Update store information
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({
        store_name: store_name.trim(),
        description: description?.trim() || null,
        email: email?.trim() || null,
        contact: contact?.trim() || null,
        address: address?.trim() || null
      })
      .eq('vendor_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Store info update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update store information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Store information updated successfully',
      store: updatedStore
    })

  } catch (error) {
    console.error('Store info update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
