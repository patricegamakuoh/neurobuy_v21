import { createClient } from '@/lib/supabase/client'

// Update cart quantity in Supabase
export const updateCartQuantity = async (userId, productId, quantity) => {
  try {
    const supabase = createClient()
    
    // Get current cart data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('cart')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const currentCart = userData.cart || {}
    
    // Update cart with new quantity
    if (quantity <= 0) {
      delete currentCart[productId]
    } else {
      currentCart[productId] = quantity
    }

    // Update user cart in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ cart: currentCart })
      .eq('id', userId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    console.error('Error updating cart:', error)
    return { success: false, error }
  }
}

// Clear user cart in Supabase
export const clearUserCart = async (userId) => {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({ cart: {} })
      .eq('id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error }
  }
}

// Get user cart from Supabase
export const getUserCart = async (userId) => {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('cart')
      .eq('id', userId)
      .single()

    if (error) throw error

    return { success: true, cart: data.cart || {} }
  } catch (error) {
    console.error('Error fetching cart:', error)
    return { success: false, error, cart: {} }
  }
}
