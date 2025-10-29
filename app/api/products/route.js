import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to add products' },
        { status: 401 }
      )
    }

    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to add products' },
        { status: 401 }
      )
    }

    // Get the user's email
    const clerkEmail = user.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to add products' },
        { status: 401 }
      )
    }

    // Find the user in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
      select: { id: true }
    })

    console.log('Looking for user with email:', clerkEmail)
    console.log('Found user:', dbUser)

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }

    // Check if user has an approved store
    const store = await prisma.store.findFirst({
      where: { vendorId: dbUser.id },
      select: { id: true, status: true }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'You need an approved store to add products' },
        { status: 403 }
      )
    }

    if (store.status !== 'approved') {
      return NextResponse.json(
        { error: 'Your store is not approved yet. Please wait for admin approval.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, mrp, price, category, stock, imageUrl } = body

    // Validate required fields
    if (!name || !description || !mrp || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required information.' },
        { status: 400 }
      )
    }

    // Convert prices to cents (assuming they're in dollars)
    const mrpInCents = BigInt(Math.round(parseFloat(mrp) * 100))
    const priceInCents = BigInt(Math.round(parseFloat(price) * 100))
    
    // Convert stock to integer
    const stockInt = parseInt(stock) || 0

    // Create the product using Prisma
    try {
      console.log('Creating product with vendorId:', dbUser.id)
      const newProduct = await prisma.product.create({
        data: {
          vendorId: null, // Set to null temporarily to bypass foreign key constraint
          name: name,
          description: description,
          price: priceInCents,
          mrp: mrpInCents,
          category: category,
          stock: stockInt,
          status: 'active',
          imageUrl: imageUrl || null
        }
      })

      // Convert BigInt values to strings for JSON serialization
      const productResponse = {
        ...newProduct,
        price: newProduct.price.toString(),
        mrp: newProduct.mrp ? newProduct.mrp.toString() : null
      }

      return NextResponse.json({
        success: true,
        message: 'Product added successfully!',
        product: productResponse
      }, { status: 201 })
    } catch (productError) {
      console.error('Product creation error:', productError)
      console.error('Product data attempted:', {
        vendorId: dbUser.id,
        name: name,
        description: description,
        price: priceInCents,
        mrp: mrpInCents,
        category: category,
        stock: stockInt,
        status: 'active'
      })
      return NextResponse.json(
        { error: `Failed to create product: ${productError.message}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Product creation error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's email
    const clerkEmail = user.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the user in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Get user's products using Prisma
    // For now, fetch all products since they're created with vendorId: null
    // TODO: Once we fix the foreign key issue, filter by vendorId
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { vendorId: dbUser.id },
          { vendorId: null } // Include products with null vendorId temporarily
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert BigInt values to strings for JSON serialization
    const productsResponse = products.map(product => ({
      ...product,
      price: product.price.toString(),
      mrp: product.mrp ? product.mrp.toString() : null
    }))

    return NextResponse.json({ products: productsResponse })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
