import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(request) {
  // Read body once at the beginning
  const body = await request.json()
  const { clerkId, email, name, imageUrl } = body
  
  console.log('User sync endpoint called with email:', email)
  
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create or update user in Supabase database
    try {
      // First, try to find existing user by email
      console.log('Looking for existing user with email:', email)
      let user = await prisma.user.findUnique({
        where: { email }
      })

      if (user) {
        console.log('User found, updating:', user.id)
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name,
            image: imageUrl,
          }
        })
      } else {
        console.log('User not found, creating new user')
        // Create new user without specifying ID - let database generate UUID
        user = await prisma.user.create({
          data: {
            email,
            name,
            image: imageUrl,
            role: 'CUSTOMER',
          }
        })
        console.log('New user created with ID:', user.id)
      }

      return NextResponse.json({ user })
    } catch (dbError) {
      console.error('Database error:', dbError)
      console.error('Error code:', dbError.code)
      console.error('Error message:', dbError.message)
      
      // If database connection fails, return a basic user object
      if (dbError.code === 'P1001' || dbError.message.includes('Can\'t reach database')) {
        return NextResponse.json({ 
          user: {
            email: email,
            name: name,
            role: 'CUSTOMER'
          }
        })
      }
      
      // For foreign key constraint errors, try to just return the user data
      if (dbError.code === 'P2003') {
        console.error('Foreign key constraint error - returning fallback user data')
        return NextResponse.json({ 
          user: {
            email: email,
            name: name,
            role: 'CUSTOMER'
          }
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error syncing user:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
