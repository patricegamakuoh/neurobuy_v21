import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { code, userId, totalAmount } = await request.json()

    if (!code || !userId || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      )
    }

    // Check if coupon is expired
    if (new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    // Check if coupon is for new users only
    if (coupon.forNewUser) {
      // Check if user has any previous orders
      const userOrders = await prisma.order.count({
        where: { userId }
      })

      if (userOrders > 0) {
        return NextResponse.json(
          { error: 'This coupon is only for new users' },
          { status: 400 }
        )
      }
    }

    // Calculate discount amount
    const discountAmount = (coupon.discount / 100) * totalAmount
    const finalAmount = totalAmount - discountAmount

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount: coupon.discount,
        discountAmount,
        finalAmount
      }
    })

  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
