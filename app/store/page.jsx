'use client'
import { dummyStoreDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })
    const [products, setProducts] = useState([]) // Add products state

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            // Fetch real products data
            const productsResponse = await fetch('/api/products')
            let products = []
            if (productsResponse.ok) {
                const data = await productsResponse.json()
                products = data.products || []
                setProducts(products) // Store products for display
            }

            // Calculate real dashboard data
            const totalProducts = products.length
            const totalEarnings = products.reduce((sum, product) => {
                // Assuming some orders exist - for now just show 0
                return sum + 0
            }, 0)
            const totalOrders = 0 // TODO: Implement orders API
            const ratings = [] // TODO: Implement ratings API

            setDashboardData({
                totalProducts,
                totalEarnings,
                totalOrders,
                ratings,
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            // Fallback to dummy data if API fails
            setDashboardData(dummyStoreDashboardData)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2>Recent Products</h2>

            <div className="mt-5">
                {
                    dashboardData.totalProducts > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Show first 6 products with real data */}
                            {products && products.length > 0 ? products.slice(0, 6).map((product, index) => (
                                <div key={product.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <Image 
                                            src={product.image_url || product.imageUrl || "/placeholder-product.svg"} 
                                            alt={product.name} 
                                            className="w-12 h-12 rounded object-cover" 
                                            width={48} 
                                            height={48}
                                            onError={(e) => {
                                                console.log('Image load error for:', product.image_url || product.imageUrl)
                                                e.target.src = "/placeholder-product.svg"
                                            }}
                                            onLoad={() => {
                                                console.log('Image loaded successfully:', product.image_url || product.imageUrl)
                                            }}
                                        />
                                        <div>
                                            <p className="font-medium text-slate-800">{product.name}</p>
                                            <p className="text-sm text-slate-500">{product.category}</p>
                                            <p className="text-sm text-emerald-600 font-medium">{currency} {((product.price || 0) / 100).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-400">
                                    <p>No products yet. <a href="/store/add-product" className="text-emerald-600 hover:text-emerald-700">Add your first product</a> to get started.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <p>No products yet. <a href="/store/add-product" className="text-emerald-600 hover:text-emerald-700">Add your first product</a> to get started.</p>
                        </div>
                    )
                }
            </div>

            <h2 className="mt-8">Total Reviews</h2>

            <div className="mt-5">
                {
                    dashboardData.ratings.length > 0 ? dashboardData.ratings.map((review, index) => (
                        <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                            <div>
                                <div className="flex gap-3">
                                    <Image src={review.user.image || '/placeholder-product.svg'} alt="" className="w-10 aspect-square rounded-full" width={100} height={100} />
                                    <div>
                                        <p className="font-medium">{review.user.name}</p>
                                        <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.review}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:items-end">
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-slate-400">{review.product?.category}</p>
                                    <p className="font-medium">{review.product?.name}</p>
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={17} className='text-transparent mt-0.5' fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">View Product</button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-400">
                            <p>No reviews yet. Reviews will appear here once customers rate your products.</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}