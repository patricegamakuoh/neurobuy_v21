import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const clerkEmail = user.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Find the user in the database with fallback to Supabase REST API
    let dbUser = null
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: clerkEmail },
        select: { id: true, role: true }
      })
    } catch (prismaError) {
      // If Prisma fails, try Supabase REST API
      console.log('Prisma user lookup failed in POST, falling back to Supabase REST API')
      const isConnectionError = 
        prismaError.code === 'P1001' ||
        prismaError.errorCode === 'P1001' ||
        prismaError.name === 'PrismaClientInitializationError' ||
        (prismaError.message && prismaError.message.includes("Can't reach database server"))
      
      if (isConnectionError) {
        try {
          const supabase = await createClient()
          const { data: supabaseUser } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', clerkEmail)
            .single()
          
          if (supabaseUser) {
            dbUser = { id: supabaseUser.id, role: supabaseUser.role }
          }
        } catch (supabaseError) {
          console.error('Supabase fallback also failed:', supabaseError)
        }
      } else {
        throw prismaError
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }

    // Allow any authenticated user to register (not restricted to LOGISTICS role)
    // The status will be 'pending' and admin will approve/reject
    // Uncomment below to restrict to LOGISTICS role only:
    /*
    if (dbUser.role !== 'LOGISTICS') {
      return NextResponse.json(
        { error: 'Only users with LOGISTICS role can register as logistics providers.' },
        { status: 403 }
      )
    }
    */

    // Check if already registered
    const existingProvider = await prisma.logisticsProvider.findUnique({
      where: { providerId: dbUser.id }
    })

    if (existingProvider) {
      return NextResponse.json(
        { error: 'You have already registered as a logistics provider.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { companyName, contactName, email, phone, regions, pricing } = body

    // Validate required fields
    if (!companyName || !regions || !Array.isArray(regions) || regions.length === 0) {
      return NextResponse.json(
        { error: 'Company name and at least one region are required.' },
        { status: 400 }
      )
    }

    // Create logistics provider
    const provider = await prisma.logisticsProvider.create({
      data: {
        providerId: dbUser.id,
        companyName,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        regions: regions, // JSON array of regions
        pricing: pricing || null,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Logistics provider registration submitted for admin approval.',
      provider
    }, { status: 201 })

  } catch (error) {
    console.error('Logistics registration error:', error)
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
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const clerkEmail = user.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Find the user in the database with fallback to Supabase REST API
    let dbUser = null
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: clerkEmail },
        select: { id: true, role: true }
      })
    } catch (prismaError) {
      // If Prisma fails, try Supabase REST API
      console.log('Prisma user lookup failed, falling back to Supabase REST API')
      const isConnectionError = 
        prismaError.code === 'P1001' ||
        prismaError.errorCode === 'P1001' ||
        prismaError.name === 'PrismaClientInitializationError' ||
        (prismaError.message && prismaError.message.includes("Can't reach database server"))
      
      if (isConnectionError) {
        try {
          const supabase = await createClient()
          const { data: supabaseUser, error: supabaseQueryError } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', clerkEmail)
            .single()
          
          if (supabaseUser) {
            dbUser = { id: supabaseUser.id, role: supabaseUser.role }
          } else if (supabaseQueryError) {
            console.error('Supabase query error:', supabaseQueryError)
            // Admin email fallback when Supabase can't find user
            const adminEmails = ['kuohpatrice@gmail.com']
            if (adminEmails.includes(clerkEmail)) {
              console.log('Admin email detected despite Supabase query error, allowing access')
              dbUser = { id: userId || 'admin-fallback', role: 'ADMIN' }
            }
          } else {
            // No error but no user found - try admin email fallback
            console.log('Supabase returned no user, checking admin email fallback')
            const adminEmails = ['kuohpatrice@gmail.com']
            if (adminEmails.includes(clerkEmail)) {
              console.log('Admin email detected, allowing access via fallback')
              dbUser = { id: userId || 'admin-fallback', role: 'ADMIN' }
            }
          }
        } catch (supabaseError) {
          console.error('Supabase fallback also failed:', supabaseError)
          // Admin email fallback as final resort
          const adminEmails = ['kuohpatrice@gmail.com']
          if (adminEmails.includes(clerkEmail)) {
            console.log('Admin email detected in final fallback')
              dbUser = { id: userId || 'admin-fallback', role: 'ADMIN' }
          }
        }
      } else {
        throw prismaError
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }

    // Check if admin requesting all applications
    if (dbUser.role === 'ADMIN') {
      let allProviders = []
      try {
        allProviders = await prisma.logisticsProvider.findMany({
          orderBy: { createdAt: 'desc' }
        })
      } catch (providerError) {
        // If Prisma fails, try Supabase REST API
        console.log('Prisma logisticsProvider findMany failed, falling back to Supabase REST API')
        const isConnectionError = 
          providerError.code === 'P1001' ||
          providerError.errorCode === 'P1001' ||
          providerError.name === 'PrismaClientInitializationError' ||
          (providerError.message && providerError.message.includes("Can't reach database server"))
        
        if (isConnectionError) {
          try {
            const supabase = await createClient()
            const { data: providers, error: supabaseError } = await supabase
              .from('logistics_providers')
              .select('*')
              .order('created_at', { ascending: false })
            
            if (!supabaseError && providers) {
              allProviders = providers.map(p => ({
                id: p.id,
                providerId: p.provider_id,
                companyName: p.company_name,
                contactName: p.contact_name,
                email: p.email,
                phone: p.phone,
                regions: p.regions,
                pricing: p.pricing,
                status: p.status,
                rejectionReason: p.rejection_reason,
                createdAt: p.created_at,
                updatedAt: p.updated_at
              }))
            }
          } catch (supabaseError) {
            console.error('Supabase logisticsProvider fallback failed:', supabaseError)
          }
        }
      }
      
      return NextResponse.json({
        applications: allProviders,
        fallback: allProviders.length > 0 ? 'supabase-rest-api' : undefined
      })
    }

    // Get provider information for regular users
    let provider = null
    try {
      provider = await prisma.logisticsProvider.findUnique({
        where: { providerId: dbUser.id }
      })
    } catch (providerError) {
      // If Prisma fails, try Supabase REST API
      console.log('Prisma logisticsProvider findUnique failed, falling back to Supabase REST API')
      const isConnectionError = 
        providerError.code === 'P1001' ||
        providerError.errorCode === 'P1001' ||
        providerError.name === 'PrismaClientInitializationError' ||
        (providerError.message && providerError.message.includes("Can't reach database server"))
      
      if (isConnectionError) {
        try {
          const supabase = await createClient()
          const { data: supabaseProvider } = await supabase
            .from('logistics_providers')
            .select('*')
            .eq('provider_id', dbUser.id)
            .single()
          
          if (supabaseProvider) {
            provider = {
              id: supabaseProvider.id,
              providerId: supabaseProvider.provider_id,
              companyName: supabaseProvider.company_name,
              contactName: supabaseProvider.contact_name,
              email: supabaseProvider.email,
              phone: supabaseProvider.phone,
              regions: supabaseProvider.regions,
              pricing: supabaseProvider.pricing,
              status: supabaseProvider.status,
              rejectionReason: supabaseProvider.rejection_reason,
              createdAt: supabaseProvider.created_at,
              updatedAt: supabaseProvider.updated_at
            }
          }
        } catch (supabaseError) {
          console.error('Supabase logisticsProvider fallback failed:', supabaseError)
        }
      }
    }

    if (!provider) {
      return NextResponse.json({
        registered: false,
        message: 'Not registered as a logistics provider'
      })
    }

    return NextResponse.json({
      registered: true,
      provider
    })

  } catch (error) {
    console.error('Error fetching logistics provider:', error)
    
    // Check if it's a connection error
    const isConnectionError = 
      error.code === 'P1001' ||
      error.errorCode === 'P1001' ||
      error.name === 'PrismaClientInitializationError' ||
      (error.message && error.message.includes("Can't reach database server"))
    
    if (isConnectionError) {
      // Return empty result instead of error for connection issues
      return NextResponse.json({
        applications: [],
        fallback: true,
        error: 'Database connection error'
      }, { status: 200 })
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
