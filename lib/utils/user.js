import { createClient } from '@/lib/supabase/client'

export const getUserRole = async () => {
  try {
    const response = await fetch('/api/user/data')
    if (response.ok) {
      const data = await response.json()
      return data.user?.role || 'CUSTOMER'
    }
    return 'CUSTOMER'
  } catch (error) {
    console.error('Error fetching user role:', error)
    return 'CUSTOMER'
  }
}

export const getUserData = async () => {
  try {
    const response = await fetch('/api/user/data')
    if (response.ok) {
      const data = await response.json()
      return data.user
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}
