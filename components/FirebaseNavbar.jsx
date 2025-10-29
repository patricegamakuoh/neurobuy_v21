'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ShoppingCart, User, Store, Package, Truck, Shield } from 'lucide-react'
import { onAuthStateChange, signOut } from '@/lib/firebase-auth'

export default function FirebaseNavbar() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            console.log('Firebase auth state changed:', user?.email)
            setUser(user)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const handleSignOut = async () => {
        try {
            await signOut()
            // Firebase automatically updates the auth state
            window.location.href = '/'
        } catch (error) {
            console.error('Logout error:', error)
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

                        {/* Cart */}
                        <Link href="/cart" className="relative text-gray-600 hover:text-emerald-600 transition">
                            <ShoppingCart size={20} />
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">0</span>
                        </Link>

                        {/* User Section */}
                        {loading ? (
                            <div className="px-8 py-2 bg-gray-300 rounded-full animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                {/* Role-based navigation links */}
                                <Link href="/create-store" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                    <Store size={16} />
                                    Create Store
                                </Link>
                                
                                <Link href="/orders" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                    <Package size={16} />
                                    Orders
                                </Link>
                                
                                <Link href="/logistics" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                    <Truck size={16} />
                                    Logistics
                                </Link>
                                
                                <span className="text-slate-600 text-sm">{user.email}</span>
                                <button 
                                    onClick={handleSignOut}
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 transition text-white rounded-full text-sm font-medium"
                                    style={{ minWidth: '80px', zIndex: 1000 }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 transition text-white rounded-full">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-gray-50 border-t">
                <div className="px-4 py-3 space-y-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </form>

                    <div className="flex justify-between items-center">
                        <Link href="/shop" className="text-gray-600 hover:text-emerald-600 transition">
                            Shop
                        </Link>
                        <Link href="/cart" className="relative text-gray-600 hover:text-emerald-600 transition">
                            <ShoppingCart size={20} />
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">0</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="px-7 py-1.5 bg-gray-300 rounded-full animate-pulse"></div>
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">{user.email}</span>
                            <button 
                                onClick={handleSignOut}
                                className="px-5 py-1.5 bg-red-600 hover:bg-red-700 text-sm transition text-white rounded-full font-medium"
                                style={{ minWidth: '70px', zIndex: 1000 }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="px-7 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-sm transition text-white rounded-full">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
