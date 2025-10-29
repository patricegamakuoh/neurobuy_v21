import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.cartItems))
            }
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.cartItems))
            }
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.cartItems))
            }
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify({}))
            }
        },
        loadCart: (state, action) => {
            const cart = action.payload
            state.cartItems = cart
            state.total = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, loadCart } = cartSlice.actions

export default cartSlice.reducer
