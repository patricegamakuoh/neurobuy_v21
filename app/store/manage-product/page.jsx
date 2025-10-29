'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { productDummyData } from "@/assets/assets"
import { EditIcon, Trash2Icon } from "lucide-react"

export default function StoreManageProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products')
            if (response.ok) {
                const { products } = await response.json()
                setProducts(products || [])
            } else {
                toast.error('Failed to fetch products')
                setProducts([])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Error fetching products')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Product deleted successfully!')
                fetchProducts() // Refresh the list
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to delete product.')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('An error occurred while deleting the product.')
        }
    }

    const toggleStockStatus = async (productId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                })
            })

            if (response.ok) {
                toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
                fetchProducts() // Refresh the list
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update product status.')
            }
        } catch (error) {
            console.error('Error updating product status:', error)
            toast.error('An error occurred while updating the product status.')
        }
    }

    useEffect(() => {
            fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl text-slate-500">Manage <span className="text-slate-800 font-medium">Products</span></h1>
                <button 
                    onClick={fetchProducts}
                    className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700 transition"
                >
                    Refresh
                </button>
            </div>
            <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image 
                                        width={40} 
                                        height={40} 
                                        className='p-1 shadow rounded cursor-pointer' 
                                        src={product.image_url || product.imageUrl || '/placeholder-product.svg'} 
                                        alt={product.name}
                                        onError={(e) => {
                                            console.log('Image load error for:', product.image_url || product.imageUrl)
                                            e.target.src = '/placeholder-product.svg'
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully:', product.image_url || product.imageUrl)
                                        }}
                                    />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {((product.mrp || 0) / 100).toLocaleString()}</td>
                            <td className="px-4 py-3">{currency} {((product.price || 0) / 100).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex justify-center items-center gap-3">
                                    <button 
                                        onClick={() => window.location.href = `/store/edit-product/${product.id}`}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Edit Product"
                                    >
                                        <EditIcon size={18} />
                                    </button>
                                    <button 
                                        onClick={() => toggleStockStatus(product.id, product.status)}
                                        className={`${product.status === 'active' ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700'}`}
                                        title={product.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                                    >
                                        {product.status === 'active' ? '✓' : '○'}
                                    </button>
                                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2Icon size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}