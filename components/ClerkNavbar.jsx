'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { Search, ShoppingCart, Store, Package, Truck, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClerkNavbar() {
    const { user, isLoaded } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [userData, setUserData] = useState(null)
    const [storeData, setStoreData] = useState(null)
    const [showCongratulations, setShowCongratulations] = useState(false)
    const [isStoreDataLoading, setIsStoreDataLoading] = useState(true)
    const [showLogisticsDropdown, setShowLogisticsDropdown] = useState(false)
    
    // Get cart count from Redux
    const cartCount = useSelector(state => state.cart?.total || 0)

    // Fetch store data
    const fetchStoreData = async (previousData = null) => {
        try {
            setIsStoreDataLoading(true)
            
            const response = await fetch('/api/stores', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
                signal: AbortSignal.timeout(30000) // 30 second timeout
            })
            
            if (response.ok) {
                const data = await response.json()
                const { store } = data
                const previousStatus = previousData?.status || storeData?.status
                setStoreData(store)
                
                // Show congratulations if store was just approved
                if (store && store.status === 'approved' && previousStatus === 'pending') {
                    setShowCongratulations(true)
                }
            }
        } catch (error) {
            // Silently handle errors - don't log to console to reduce noise
            if (error.name !== 'AbortError') {
                console.error('Error fetching store data:', error.message)
            }
        } finally {
            setIsStoreDataLoading(false)
        }
    }

    // Sync Clerk user with Supabase database
    useEffect(() => {
        if (user && isLoaded) {
            // Only fetch if we don't have data yet, and use a ref to prevent double fetching
            const fetchUserAndStore = async () => {
                if (!userData) {
                    await syncUserWithSupabase(user)
                }
                if (!storeData) {
                    await fetchStoreData()
                }
            }
            fetchUserAndStore()
        }
    }, [user?.id, isLoaded]) // Only depend on user.id, not the whole user object

    // Periodically check store status if pending
    useEffect(() => {
        if (!user || !isLoaded || !storeData || storeData.status !== 'pending') return
        
        const interval = setInterval(() => {
            fetchStoreData(storeData)
        }, 30000) // Check every 30 seconds
        
        return () => clearInterval(interval)
    }, [storeData?.status, user, isLoaded])

    // Removed debug logging to improve performance

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showLogisticsDropdown && !event.target.closest('.relative')) {
                setShowLogisticsDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showLogisticsDropdown])

    const syncUserWithSupabase = async (clerkUser) => {
        try {
            const response = await fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clerkId: clerkUser.id,
                    email: clerkUser.emailAddresses[0]?.emailAddress,
                    name: clerkUser.fullName,
                    imageUrl: clerkUser.imageUrl,
                }),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            })
            
            if (response.ok) {
                const data = await response.json()
                console.log('User data from API:', data.user)
                console.log('User role:', data.user?.role)
                setUserData(data.user)
            }
        } catch (error) {
            console.error('Error syncing user:', error)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            setUserData(null)
            toast.success('Logged out successfully')
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Logout failed')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">NeuroBuy</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-lg mx-8">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        <Link href="/shop" className="text-gray-600 hover:text-emerald-600 transition">
                            Shop
                        </Link>

                        <Link href="/cart" className="relative text-gray-600 hover:text-emerald-600 transition">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 left-3 text-[10px] text-white bg-emerald-600 size-4 rounded-full flex items-center justify-center font-medium">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Section */}
                        {!isLoaded ? (
                            <div className="px-8 py-2 bg-gray-300 rounded-full animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                {/* Role-based navigation links */}
                                {(() => {
                                    const userEmail = user?.emailAddresses[0]?.emailAddress
                                    const isAdmin = userData?.role === 'ADMIN' || userEmail === 'kuohpatrice@gmail.com'
                                    
                                    console.log('Admin link check:', { 
                                        userData: userData,
                                        role: userData?.role,
                                        userEmail: userEmail,
                                        isAdmin: isAdmin
                                    })
                                    
                                    return isAdmin && (
                                        <Link href="/admin" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                            <Shield size={16} />
                                            Admin
                                        </Link>
                                    )
                                })()}
                                
                                {/* Show "My Store" link if user has VENDOR role or approved store */}
                                {(() => {
                                    // Show loading state while fetching store data
                                    if (isStoreDataLoading) {
                                        return (
                                            <div className="flex items-center gap-1 px-3 py-1 text-sm text-slate-400">
                                                <Store size={16} />
                                                <span className="animate-pulse">Loading...</span>
                                            </div>
                                        )
                                    }
                                    
                                    // Admin can also see Create Store link
                                    const hasApprovedStore = storeData && storeData.status === 'approved'
                                    const isVendor = userData?.role === 'VENDOR'
                                    const showMyStore = hasApprovedStore || isVendor
                                    
                                    // Debug logging
                                    console.log('My Store link check:', {
                                        hasApprovedStore,
                                        isVendor,
                                        showMyStore,
                                        storeStatus: storeData?.status,
                                        userRole: userData?.role,
                                        storeDataExists: !!storeData
                                    })
                                    
                                    return showMyStore ? (
                                        <Link href="/store" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                            <Store size={16} />
                                            My Store
                                        </Link>
                                    ) : (
                                        <Link href="/create-store" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                            <Store size={16} />
                                            Create Store
                                        </Link>
                                    )
                                })()}
                                
                                <Link href="/orders" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                    <Package size={16} />
                                    Orders
                                </Link>
                                
                                {/* Logistics dropdown for store owners */}
                                {(() => {
                                    const isStoreOwner = (storeData && storeData.status === 'approved') || userData?.role === 'VENDOR'
                                    
                                    // Add debug logging
                                    console.log('Logistics dropdown check:', {
                                        isStoreOwner,
                                        storeStatus: storeData?.status,
                                        userRole: userData?.role,
                                        storeDataExists: !!storeData
                                    })
                                    
                                    if (isStoreOwner) {
                                        return (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowLogisticsDropdown(!showLogisticsDropdown)}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition"
                                                >
                                                    <Truck size={16} />
                                                    Logistics
                                                    <svg className={`w-4 h-4 transition-transform ${showLogisticsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {showLogisticsDropdown && (
                                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200" style={{ zIndex: 9999 }}>
                                                        <div className="py-2">
                                                            <Link
                                                                href="/logistics-service/register"
                                                                onClick={() => setShowLogisticsDropdown(false)}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                            >
                                                                Become a Logistics Provider
                                                            </Link>
                                                            <Link
                                                                href="/logistics-service/find"
                                                                onClick={() => setShowLogisticsDropdown(false)}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                            >
                                                                Find Delivery Partners
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                    
                                    // For LOGISTICS role users
                                    if (userData?.role === 'LOGISTICS') {
                                        return (
                                            <Link href="/logistics-service" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                                <Truck size={16} />
                                                My Services
                                            </Link>
                                        )
                                    }
                                    
                                    // For regular users
                                    return (
                                        <Link href="/logistics-service/register" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                            <Truck size={16} />
                                            Logistics
                                        </Link>
                                    )
                                })()}
                                
                                <span className="text-slate-600 text-sm">{user.emailAddresses[0]?.emailAddress}</span>
                                <button 
                                    onClick={handleSignOut}
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 transition text-white rounded-full text-sm font-medium"
                                    style={{ minWidth: '80px', zIndex: 1000 }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/sign-in" className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 transition text-white rounded-full">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Congratulations Modal */}
            {showCongratulations && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCongratulations(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                            <p className="text-gray-600 mb-6">
                                Your store has been approved! You can now start adding products and selling on NeuroBuy.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowCongratulations(false)}
                                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Close
                                </button>
                                <Link 
                                    href="/store"
                                    onClick={() => setShowCongratulations(false)}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                >
                                    Go to Store Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
