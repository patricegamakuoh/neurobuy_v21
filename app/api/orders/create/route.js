import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request) {
  try {
    const { orderItems, addressId, paymentMethod, coupon, total } = await request.json()

    if (!orderItems || !addressId || !paymentMethod || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clerkUser = await currentUser()
    const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }

    const userId = dbUser.id

    // Get address
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!address || address.userId !== userId) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    // Get all products to validate and get names
    const productIds = orderItems.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds } 
      }
    })

    if (products.length !== orderItems.length) {
      return NextResponse.json(
        { error: 'Some products not found' },
        { status: 400 }
      )
    }

    // Determine store ID (assuming single store per order for now)
    const firstProduct = products[0]
    const store = await prisma.store.findFirst({
      where: { 
        vendorId: firstProduct.vendorId 
      }
    })

    const storeId = store?.id || null

    // Create order with new schema
    const order = await prisma.order.create({
      data: {
        userId: userId,
        storeId: storeId,
        totalPrice: BigInt(Math.round(parseFloat(total) * 100)), // Convert to cents/centimes
        currency: 'XAF',
        status: 'pending',
        orderItems: {
          create: orderItems.map(item => {
            const product = products.find(p => p.id === item.productId)
            return {
              productId: item.productId,
              name: product.name,
              quantity: item.quantity,
              unitPrice: BigInt(Math.round(parseFloat(item.price) * 100)),
              currency: 'XAF'
            }
          })
        },
        payments: {
          create: {
            paymentMethod: paymentMethod.toUpperCase(),
            paymentStatus: paymentMethod.toUpperCase() === 'STRIPE' ? 'completed' : 'pending'
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        store: true,
        payments: true
      }
    })

    // Clear user cart (stored in localStorage, so no database update needed)
    // This is handled client-side

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
