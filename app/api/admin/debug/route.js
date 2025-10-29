import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...')
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth test:', { user: user?.id, authError })
    
    // Test 3: Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1)
    console.log('Users table test:', { users, usersError })
    
    // Test 4: Check stores table
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)
    console.log('Stores table test:', { stores, storesError })
    
    return NextResponse.json({
      auth: {
        user: user ? { id: user.id, email: user.email } : null,
        authError: authError?.message
      },
      users: {
        data: users,
        error: usersError?.message
      },
      stores: {
        data: stores,
        error: storesError?.message
      },
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
