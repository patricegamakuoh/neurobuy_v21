import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await currentUser()
    const email = user.emailAddresses[0]?.emailAddress

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    })

    if (dbUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, rejectionMessage } = await request.json()

    // Update status to rejected and store rejection message
    await prisma.logisticsProvider.update({
      where: { id },
      data: { 
        status: 'rejected',
        rejectionReason: rejectionMessage || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting logistics provider:', error)
    return NextResponse.json(
      { error: 'Failed to reject' },
      { status: 500 }
    )
  }
}
