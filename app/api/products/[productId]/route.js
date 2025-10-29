import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch a specific product
export async function GET(request, { params }) {
  try {
    const { productId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user has a store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', user.id)
      .eq('status', 'approved')
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'You need an approved store to manage products' },
        { status: 403 }
      )
    }

    // Fetch the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('vendor_id', user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to access it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update a specific product
export async function PUT(request, { params }) {
  try {
    const { productId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to update products' },
        { status: 401 }
      )
    }

    // Check if user has an approved store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', user.id)
      .eq('status', 'approved')
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'You need an approved store to update products' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, mrp, price, category, stock, status, imageUrl } = body

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      )
    }

    // Update the product
    const updateData = {
      name,
      description,
      price: Math.round(price * 100), // Convert to cents
      category,
      stock: stock || 0,
      status: status || 'active',
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (mrp) updateData.mrp = Math.round(mrp * 100)
    if (imageUrl) updateData.image_url = imageUrl

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .eq('vendor_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Product update error:', updateError)
      return NextResponse.json(
        { error: `Failed to update product: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific product
export async function DELETE(request, { params }) {
  try {
    const { productId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to delete products' },
        { status: 401 }
      )
    }

    // Check if user has an approved store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('vendor_id', user.id)
      .eq('status', 'approved')
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'You need an approved store to delete products' },
        { status: 403 }
      )
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('vendor_id', user.id)

    if (deleteError) {
      console.error('Product deletion error:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete product: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
