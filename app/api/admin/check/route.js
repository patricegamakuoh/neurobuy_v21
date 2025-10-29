import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    try {
      // Get the current user from Clerk
      const user = await currentUser()
      
      if (!user) {
        return NextResponse.json({ isAdmin: false })
      }

      // Get the user's email
      const clerkEmail = user.emailAddresses[0]?.emailAddress
      
      if (!clerkEmail) {
        console.error('No email found for user:', userId)
        return NextResponse.json({ isAdmin: false })
      }

      console.log('Checking admin status for email:', clerkEmail)

      // Check if user has admin role in Supabase database
      let userData = null
      try {
        userData = await prisma.user.findUnique({
          where: { email: clerkEmail },
          select: { role: true }
        })
      } catch (dbError) {
        console.error('Database connection error, using fallback check:', dbError.message)
        // Fallback: if database is unreachable, check if email is the admin email
        if (clerkEmail === 'kuohpatrice@gmail.com') {
          console.log('Admin email detected in fallback mode')
          return NextResponse.json({ isAdmin: true })
        }
        return NextResponse.json({ isAdmin: false })
      }

      console.log('User data from database:', userData)

      if (!userData) {
        console.log('User not found in database')
        return NextResponse.json({ isAdmin: false })
      }

      const isAdmin = userData.role === 'ADMIN'

      console.log('Is admin:', isAdmin)

      return NextResponse.json({ isAdmin })
    } catch (error) {
      console.error('Error in admin check:', error)
      return NextResponse.json({ isAdmin: false })
    }

  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
