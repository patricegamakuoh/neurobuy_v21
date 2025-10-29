'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"
import Loading from "@/components/Loading"

export default function EditProduct() {
    const { productId } = useParams()
    const router = useRouter()

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        stock: 0,
        status: "active"
    })
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const fetchProduct = async () => {
        try {
            const response = await fetch('/api/products')
            if (response.ok) {
                const data = await response.json()
                const product = data.products?.find(p => p.id === productId)
                if (product) {
                    setProductInfo({
                        name: product.name || "",
                        description: product.description || "",
                        mrp: product.mrp || 0,
                        price: product.price || 0,
                        category: product.category || "",
                        stock: product.stock || 0,
                        status: product.status || "active"
                    })
                } else {
                    toast.error('Product not found')
                    router.push('/store/manage-product')
                }
            } else {
                toast.error('Failed to fetch product details')
                router.push('/store/manage-product')
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            toast.error('Failed to fetch product details')
            router.push('/store/manage-product')
        } finally {
            setFetchLoading(false)
        }
    }

    useEffect(() => {
        if (productId) {
            fetchProduct()
        }
    }, [productId])

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            // Validate form data
            if (!productInfo.name || !productInfo.description || !productInfo.mrp || !productInfo.price || !productInfo.category) {
                toast.error('Please fill in all required fields')
                return
            }

            if (parseFloat(productInfo.price) >= parseFloat(productInfo.mrp)) {
                toast.error('Offer price must be less than actual price')
                return
            }

            // Upload first image if provided
            let imageUrl = productInfo.imageUrl // Keep existing image if no new one uploaded
            if (images[1]) {
                const fd = new FormData()
                fd.append('file', images[1])
                fd.append('type', 'product')
                
                try {
                    const uploadRes = await fetch('/api/upload/simple', { method: 'POST', body: fd })
                    const uploadData = await uploadRes.json()
                    
                    if (uploadRes.ok) {
                        imageUrl = uploadData.url
                        console.log('New image uploaded successfully:', imageUrl)
                    } else {
                        console.error('Image upload failed:', uploadData.error)
                        toast.error('Image upload failed - keeping existing image')
                    }
                } catch (err) {
                    console.error('Upload failed', err)
                    toast.error('Image upload failed - keeping existing image')
                }
            }

            // Prepare form data
            const formData = {
                name: productInfo.name,
                description: productInfo.description,
                mrp: productInfo.mrp,
                price: productInfo.price,
                category: productInfo.category,
                stock: productInfo.stock || 0,
                status: productInfo.status,
                imageUrl: imageUrl
            }

            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || 'Product updated successfully!')
                router.push('/store/manage-product')
            } else {
                toast.error(data.error || 'Failed to update product. Please try again.')
            }
        } catch (error) {
            console.error('Error updating product:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (fetchLoading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Edit <span className="text-slate-800 font-medium">Product</span></h1>
            
            <form onSubmit={onSubmitHandler} className="mt-6">
                <p className="mt-7">Product Images</p>

                <div htmlFor="" className="flex gap-3 mt-4">
                    {Object.keys(images).map((key) => (
                        <label key={key} htmlFor={`images${key}`} className="relative">
                            <Image 
                                width={300} 
                                height={300} 
                                className='h-15 w-auto border border-slate-200 rounded cursor-pointer' 
                                src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} 
                                alt="" 
                            />
                            <input 
                                type="file" 
                                accept='image/*' 
                                id={`images${key}`} 
                                onChange={e => setImages({ ...images, [key]: e.target.files[0] })} 
                                hidden 
                            />
                        </label>
                    ))}
                </div>
                <p className="text-sm text-slate-400 mt-2">Upload new images to replace existing ones</p>

                <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                    Name
                    <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>

                <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                    Description
                    <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>

                <div className="flex gap-5">
                    <label htmlFor="" className="flex flex-col gap-2 ">
                        Actual Price (XAF)
                        <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                    </label>
                    <label htmlFor="" className="flex flex-col gap-2 ">
                        Offer Price (XAF)
                        <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                    </label>
                </div>

                <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                    Stock Quantity
                    <input type="number" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="Enter stock quantity" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" />
                </label>

                <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                    Product Status
                    <select name="status" onChange={onChangeHandler} value={productInfo.status} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </label>

                <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                <br />

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating Product...' : 'Update Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/store/manage-product')}
                        className="bg-gray-500 text-white px-6 mt-7 py-2 hover:bg-gray-600 rounded transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
