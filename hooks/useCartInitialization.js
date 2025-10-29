import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '@clerk/nextjs';
import { loadCart, clearCart } from '@/lib/features/cart/cartSlice';

export const useCartInitialization = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.cart);
    const [initialized, setInitialized] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (!initialized) {
            initializeCart();
        }
    }, [initialized]);

    const initializeCart = async () => {
        try {
            // Load cart from localStorage for both authenticated and non-authenticated users
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    const cart = JSON.parse(savedCart);
                    // Check if cart has any items
                    const hasItems = Object.keys(cart).length > 0 && Object.values(cart).some(qty => qty > 0);
                    if (hasItems) {
                        dispatch(loadCart(cart));
                    } else {
                        // Clear empty cart
                        dispatch(clearCart());
                        localStorage.removeItem('cart');
                    }
                } catch (error) {
                    console.error('Error parsing local cart:', error);
                    dispatch(clearCart());
                    localStorage.removeItem('cart');
                }
            } else {
                // No local cart data, clear any existing cart
                dispatch(clearCart());
            }
        } catch (error) {
            console.error('Error initializing cart:', error);
            dispatch(clearCart());
        } finally {
            setInitialized(true);
        }
    };

    return { initialized, user };
};
