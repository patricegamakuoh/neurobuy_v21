import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          stores: true,
          addresses: true
        }
      })
      return NextResponse.json({ user: userData })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      // Return basic user info from Supabase auth if database is unavailable
      return NextResponse.json({ 
        user: {
          id: user.id,
          email: user.email,
          role: 'CUSTOMER' // Default role
        }
      })
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
