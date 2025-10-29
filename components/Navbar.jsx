'use client'
import { Search, ShoppingCart, User, Store, Truck, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/auth'
import { useCartInitialization } from '@/hooks/useCartInitialization'

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const cartCount = useSelector(state => state.cart.total)
    const dispatch = useDispatch()
    
    // Use cart initialization hook
    const { initialized: cartInitialized } = useCartInitialization()

    useEffect(() => {
        const supabase = createClient()
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email)
                setUser(session?.user ?? null)
                if (session?.user) {
                    // Always set default user data since database is not working
                    setUserData({
                        id: session.user.id,
                        email: session.user.email,
                        role: 'CUSTOMER'
                    })
                } else {
                    setUserData(null)
                }
                setLoading(false)
            }
        )

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            console.log('Initial session:', session?.user?.email)
            setUser(session?.user ?? null)
            if (session?.user) {
                // Always set default user data since database is not working
                setUserData({
                    id: session.user.id,
                    email: session.user.email,
                    role: 'CUSTOMER'
                })
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])


    const handleSignOut = async () => {
        // Clear local state immediately
        setUser(null)
        setUserData(null)
        
        // Try to sign out from Supabase (but don't wait for it)
        try {
            await signOut()
        } catch (error) {
            // Ignore Supabase errors - local logout is more important
        }
        
        // Force a hard redirect to home page to ensure clean state
        window.location.href = '/'
    }

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-emerald-600">Neuro</span>Buy<span className="text-emerald-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-emerald-500">
                            v21
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {loading ? (
                            <div className="px-8 py-2 bg-gray-300 rounded-full animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                {/* Role-based navigation links */}
                                {userData?.role === 'ADMIN' && (
                                    <Link href="/admin" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                        <Shield size={16} />
                                        Admin
                                    </Link>
                                )}
                                
                                {userData?.role === 'VENDOR' && userData?.stores && userData.stores.length > 0 && (
                                    <Link href="/store" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                        <Store size={16} />
                                        Store
                                    </Link>
                                )}
                                
                                {userData?.role === 'LOGISTICS' && (
                                    <Link href="/logistics" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                        <Truck size={16} />
                                        Logistics
                                    </Link>
                                )}
                                
                                {userData?.role === 'CUSTOMER' && (
                                    <>
                                        <Link href="/orders" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                            <User size={16} />
                                            Orders
                                        </Link>
                                        <Link href="/logistics-service" className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 transition">
                                            <Truck size={16} />
                                            Logistics
                                        </Link>
                                    </>
                                )}
                                
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

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
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
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar