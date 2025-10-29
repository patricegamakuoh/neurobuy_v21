import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('Store creation endpoint called')
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    console.log('User ID from auth:', userId)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a store' },
        { status: 401 }
      )
    }

    // Get the current user from Clerk
    const user = await currentUser()
    console.log('Current user from Clerk:', user?.emailAddresses[0]?.emailAddress)
    
    if (!user) {
      console.log('No user found from Clerk')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a store' },
        { status: 401 }
      )
    }

    // Get the user's email
    const clerkEmail = user.emailAddresses[0]?.emailAddress
    console.log('Clerk email:', clerkEmail)
    console.log('Clerk email (lowercase):', clerkEmail?.toLowerCase())
    console.log('Clerk email (trimmed):', clerkEmail?.trim())
    
    if (!clerkEmail) {
      console.log('No email found in Clerk user')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a store' },
        { status: 401 }
      )
    }

    // Find the user in the database - try exact match first
    console.log('Looking for user in database with email:', clerkEmail)
    let dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
      select: { id: true, email: true }
    })
    
    // If not found, try lowercase
    if (!dbUser) {
      console.log('Not found with exact match, trying lowercase...')
      dbUser = await prisma.user.findUnique({
        where: { email: clerkEmail.toLowerCase() },
        select: { id: true, email: true }
      })
    }
    
    console.log('Database user found:', dbUser ? 'Yes' : 'No')
    if (dbUser) {
      console.log('Found user email in database:', dbUser.email)
    }

    if (!dbUser) {
      console.log('User not found in database for email:', clerkEmail)
      console.log('Attempting to create user automatically...')
      
      // Try to auto-sync the user
      try {
        dbUser = await prisma.user.create({
          data: {
            email: clerkEmail,
            name: user.fullName || null,
            image: user.imageUrl || null,
            role: 'CUSTOMER',
          }
        })
        console.log('User created automatically with ID:', dbUser.id)
      } catch (createError) {
        console.error('Failed to create user:', createError)
        return NextResponse.json(
          { error: 'User not found. Please sign out and sign in again to sync your account.' },
          { status: 401 }
        )
      }
    }

    console.log('Found user in database with ID:', dbUser.id)

    const body = await request.json()
    const { name, username, description, email, contact, address, image } = body

    // Validate required fields
    if (!name || !username || !description || !email || !contact || !address) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required information.' },
        { status: 400 }
      )
    }

    // Check if store with same username already exists
    const existingStore = await prisma.store.findUnique({
      where: { username },
      select: { id: true }
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'A store with this username already exists. Please choose a different username.' },
        { status: 400 }
      )
    }

    // Check if user already has a store
    const userStore = await prisma.store.findFirst({
      where: { vendorId: dbUser.id },
      select: { id: true, status: true }
    })

    if (userStore) {
      // If store is rejected, allow user to delete and resubmit
      if (userStore.status === 'rejected') {
        return NextResponse.json(
          { 
            error: 'You already have a rejected store. Please delete it first before creating a new one.',
            canResubmit: true,
            storeId: userStore.id
          },
          { status: 400 }
        )
      }
      
      // If store is pending or approved, don't allow creation
      return NextResponse.json(
        { error: 'You already have a store. You can only create one store per account.' },
        { status: 400 }
      )
    }

    // Create the store
    console.log('About to create store with vendorId:', dbUser.id)
    console.log('DB user details:', JSON.stringify(dbUser, null, 2))
    
    // Double-check that the user actually exists in the database
    const userExists = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: { id: true, email: true, name: true }
    })
    
    console.log('User exists check:', userExists ? 'YES' : 'NO')
    if (!userExists) {
      console.error('CRITICAL: User ID exists in query but not in database!')
      return NextResponse.json(
        { error: 'User account not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }
    
    // Log the vendorId to check its type
    console.log('vendorId type:', typeof dbUser.id)
    console.log('vendorId value:', dbUser.id)
    console.log('vendorId length:', dbUser.id?.length)
    
    const newStore = await prisma.store.create({
      data: {
        vendorId: dbUser.id,
        storeName: name,
        username: username,
        description: description,
        email: email,
        contact: contact,
        address: address,
        imageUrl: image || null,
        status: 'pending' // Store needs admin approval
      }
    })

    // Update user role to VENDOR
    try {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: 'VENDOR' }
      })
    } catch (roleUpdateError) {
      console.error('User role update error:', roleUpdateError)
      // Don't fail the request if role update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Store created successfully! It will be reviewed by admin before activation.',
      store: newStore
    }, { status: 201 })

  } catch (error) {
    console.error('Store creation error:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Failed to create store. Please try again.', 
        details: error.message,
        code: error?.code
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ store: null })
    }

    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ store: null })
    }

    // Get the user's email
    const clerkEmail = user.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json({ store: null })
    }

    // Find the user in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ store: null })
    }

    // Get user's store with rejection reason
    const store = await prisma.store.findFirst({
      where: { vendorId: dbUser.id },
      select: {
        id: true,
        vendorId: true,
        storeName: true,
        description: true,
        username: true,
        email: true,
        contact: true,
        address: true,
        imageUrl: true,
        status: true,
        rejectionReason: true,
        createdAt: true
      }
    })

    return NextResponse.json({ store })

  } catch (error) {
    console.error('Store fetch error:', error)
    return NextResponse.json({ store: null })
  }
}

export async function DELETE(request) {
  try {
    // Check if user is authenticated with Clerk
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

    // Get the user's email
    const clerkEmail = user.emailAddresses[0]?.emailAddress
    
    if (!clerkEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
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
        { status: 404 }
      )
    }

    // Get user's store
    const store = await prisma.store.findFirst({
      where: { vendorId: dbUser.id },
      select: { id: true, status: true }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of rejected stores
    if (store.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Only rejected stores can be deleted. Please contact support if you need to delete an approved or pending store.' },
        { status: 403 }
      )
    }

    // Delete the store
    await prisma.store.delete({
      where: { id: store.id }
    })

    // Revert user role to CUSTOMER
    try {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: 'CUSTOMER' }
      })
    } catch (roleUpdateError) {
      console.error('User role update error:', roleUpdateError)
      // Don't fail the request if role update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully. You can now create a new store.'
    })

  } catch (error) {
    console.error('Store deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete store. Please try again.' },
      { status: 500 }
    )
  }
}
