import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')

    let whereClause = {}
    
    if (region) {
      whereClause.region = region
    }

    const logistics = await prisma.logistics.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      logisticsProviders: logistics 
    })
  } catch (error) {
    console.error('Error fetching logistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
