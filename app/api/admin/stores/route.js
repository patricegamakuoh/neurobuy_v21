import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to retry database operations
async function retryQuery(queryFn, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await queryFn()
    } catch (error) {
      if (error.code === 'P1001' && i < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
}

// GET - Fetch all stores for admin management
export async function GET(request) {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
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

      // Check if user has admin role with retry, fallback to email check if Prisma fails
      let userData = null
      try {
        userData = await retryQuery(async () => {
          return await prisma.user.findUnique({
            where: { email: clerkEmail },
            select: { role: true }
          })
        })
      } catch (prismaError) {
        // If Prisma fails, check admin via email fallback (hardcoded admin emails)
        console.log('Prisma admin check failed, using email fallback')
        const adminEmails = ['kuohpatrice@gmail.com'] // Add your admin emails here
        if (adminEmails.includes(clerkEmail)) {
          userData = { role: 'ADMIN' }
        } else {
          // Try Supabase REST API as fallback
          try {
            const supabase = await createClient()
            const { data: supabaseUser } = await supabase
              .from('users')
              .select('role')
              .eq('email', clerkEmail)
              .single()
            
            if (supabaseUser && supabaseUser.role === 'ADMIN') {
              userData = { role: 'ADMIN' }
            }
          } catch (supabaseCheckError) {
            console.error('Supabase admin check also failed:', supabaseCheckError)
          }
        }
      }

      if (!userData || userData.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      // Get query parameters
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') // 'pending', 'approved', 'rejected', or null for all

      // Build query
      let query = {
        orderBy: { createdAt: 'desc' }
      }

      // Filter by status if provided
      if (status) {
        query.where = { status }
      }

      // Fetch stores with retry
      const stores = await retryQuery(async () => {
        return await prisma.store.findMany(query)
      })
      
      console.log('Fetched stores:', stores.length)
      if (stores.length > 0) {
        console.log('First store data:', JSON.stringify(stores[0], null, 2))
        console.log('First store storeName:', stores[0].storeName)
        console.log('First store imageUrl:', stores[0].imageUrl)
        console.log('First store description:', stores[0].description)
      }

      // Fetch user data for each store
      const storesWithUsers = []
      for (const store of stores || []) {
        let userInfo = { id: store.vendorId, name: 'Unknown User', email: 'No email' }
        
        try {
          const fetchedUserData = await retryQuery(async () => {
            return await prisma.user.findUnique({
              where: { id: store.vendorId },
              select: { id: true, name: true, email: true }
            })
          }).catch(() => null)
          
          if (fetchedUserData) {
            userInfo = fetchedUserData
          }
        } catch (fetchUserError) {
          console.error('Error fetching user for store:', fetchUserError)
        }
        
        storesWithUsers.push({
          ...store,
          users: userInfo
        })
      }

      return NextResponse.json({ stores: storesWithUsers })

    } catch (dbError) {
      console.error('Database error in admin stores:', dbError)
      console.error('Error code:', dbError.code)
      console.error('Error name:', dbError.name)
      console.error('Error message:', dbError.message)
      
      // Check if it's a connection error (check multiple properties and message)
      const isConnectionError = 
        dbError.code === 'P1001' ||
        dbError.errorCode === 'P1001' ||
        dbError.name === 'PrismaClientInitializationError' ||
        (dbError.message && dbError.message.includes("Can't reach database server"))
      
      if (isConnectionError) {
        // Fallback to Supabase REST API when Prisma fails
        console.log('Prisma connection failed, falling back to Supabase REST API')
        try {
          const supabase = await createClient()
          const { searchParams } = new URL(request.url)
          const status = searchParams.get('status')
          
          // Build Supabase query
          let supabaseQuery = supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false })
          
          // Filter by status if provided
          if (status) {
            supabaseQuery = supabaseQuery.eq('status', status)
          }
          
          const { data: stores, error: supabaseError } = await supabaseQuery
          
          if (supabaseError) {
            console.error('Supabase REST API error:', supabaseError)
            return NextResponse.json(
              {
                error: 'Database connection error',
                details: 'Cannot reach database server. Falling back to empty list.',
                fallback: true,
                stores: []
              },
              { status: 200 }
            )
          }
          
          // Fetch user data for each store
          const storesWithUsers = []
          for (const store of stores || []) {
            let userInfo = { id: store.vendor_id, name: 'Unknown User', email: 'No email' }
            
            // Try to fetch user data
            if (store.vendor_id) {
              try {
                const { data: userData } = await supabase
                  .from('users')
                  .select('id, name, email')
                  .eq('id', store.vendor_id)
                  .single()
                
                if (userData) {
                  userInfo = userData
                }
              } catch (userFetchError) {
                console.error('Error fetching user for store:', userFetchError)
              }
            }
            
            storesWithUsers.push({
              id: store.id,
              vendorId: store.vendor_id,
              storeName: store.store_name,
              description: store.description,
              username: store.username,
              email: store.email,
              contact: store.contact,
              address: store.address,
              imageUrl: store.image_url,
              status: store.status,
              rejectionReason: store.rejection_reason,
              createdAt: store.created_at,
              users: userInfo
            })
          }
          
          console.log('Fetched stores via Supabase REST API fallback:', storesWithUsers.length)
          
          return NextResponse.json({
            stores: storesWithUsers,
            fallback: true,
            source: 'supabase-rest-api'
          })
        } catch (supabaseFallbackError) {
          console.error('Supabase fallback also failed:', supabaseFallbackError)
          return NextResponse.json(
            {
              error: 'Database connection error',
              details: 'Cannot reach database server. Falling back to empty list.',
              fallback: true,
              stores: []
            },
            { status: 200 }
          )
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: dbError.message || 'Unknown database error',
          stores: [] // Return empty array so UI doesn't break
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Admin stores fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message || 'Unknown error',
        stores: [] // Return empty array so UI doesn't break
      },
      { status: 200 }
    )
  }
}

// PATCH - Update store status (approve/reject)
export async function PATCH(request) {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
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

      // Check if user has admin role
      const userData = await prisma.user.findUnique({
        where: { email: clerkEmail },
        select: { role: true }
      })

      if (!userData || userData.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const { storeId, status, rejectionReason } = body

      if (!storeId || !status) {
        return NextResponse.json(
          { error: 'Store ID and status are required' },
          { status: 400 }
        )
      }

      if (!['approved', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be either "approved" or "rejected"' },
          { status: 400 }
        )
      }

      // Prepare update data
      const updateData = { status }
      
      // If rejecting, include the rejection reason
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason
      }
      
      // If approving, clear any previous rejection reason
      if (status === 'approved') {
        updateData.rejectionReason = null
      }

      // Update store status
      console.log('Updating store with data:', updateData)
      const updatedStore = await prisma.store.update({ 
        where: { id: storeId },
        data: updateData,
        select: {
          id: true,
          status: true,
          vendorId: true,
          createdAt: true
        }
      })
      console.log('Store updated successfully:', updatedStore)

      // If approved, also update user role to VENDOR (if not already)
      if (status === 'approved' && updatedStore?.vendorId) {
        try {
          await prisma.user.update({
            where: { id: updatedStore.vendorId },
            data: { role: 'VENDOR' }
          })
        } catch (roleUpdateError) {
          console.error('Error updating user role:', roleUpdateError)
          // Don't fail the request if role update fails
        }
      }

      // Fetch user data for the updated store
      let ownerData = { id: updatedStore.vendorId, name: 'Unknown User', email: 'No email' }
      
      try {
        const ownerInfo = await prisma.user.findUnique({
          where: { id: updatedStore.vendorId },
          select: { id: true, name: true, email: true }
        })
        
        if (ownerInfo) {
          ownerData = ownerInfo
        }
      } catch (fetchError) {
        console.error('Error fetching user data:', fetchError)
      }

      return NextResponse.json({
        success: true,
        message: `Store ${status} successfully`,
        store: {
          ...updatedStore,
          users: ownerData
        }
      })

    } catch (dbError) {
      console.error('Database error in admin store update:', dbError)
      console.error('Error code:', dbError.code)
      console.error('Error message:', dbError.message)
      console.error('Error meta:', dbError.meta)
      
      // Check if it's a connection error
      if (dbError.code === 'P1001') {
        return NextResponse.json(
          { 
            error: 'Database connection error. Please check your DATABASE_URL in .env.local',
            details: 'Cannot reach database server'
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: dbError.message,
          code: dbError.code,
          meta: dbError.meta
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Admin store update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
