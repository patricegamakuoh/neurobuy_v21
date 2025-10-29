'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function StoreAddProduct() {

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        stock: 0,
    })
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)


    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const generateWithAI = async (imageFile) => {
        if (!imageFile) {
            toast.error('Please select an image first')
            return
        }

        console.log('Starting AI generation with image:', imageFile.name)
        setAiLoading(true)
        
        try {
            // Convert image to base64
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const base64Data = e.target.result.split(',')[1]
                    const imageType = imageFile.type
                    
                    console.log('Image converted to base64, type:', imageType)
                    console.log('Base64 length:', base64Data.length)

                    const response = await fetch('/api/ai/generate-product', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            imageBase64: base64Data,
                            imageType: imageType
                        })
                    })

                    console.log('API response status:', response.status)
                    const data = await response.json()
                    console.log('API response data:', data)

                    if (response.ok && data.success) {
                        const aiData = data.data
                        console.log('AI generated data:', aiData)
                        
                        // Parse price range with better error handling
                        let avgPrice = 5000 // Default price
                        let mrpPrice = 6500 // Default MRP
                        
                        if (aiData.priceRange && typeof aiData.priceRange === 'string') {
                            const priceParts = aiData.priceRange.split('-').map(p => parseInt(p.trim()))
                            if (priceParts.length === 2 && !isNaN(priceParts[0]) && !isNaN(priceParts[1])) {
                                avgPrice = Math.round((priceParts[0] + priceParts[1]) / 2)
                                mrpPrice = Math.round(avgPrice * 1.3)
                            }
                        }

                        setProductInfo({
                            name: aiData.name || 'AI Generated Product',
                            description: aiData.description || 'AI-generated product description',
                            category: aiData.category || 'Others',
                            price: avgPrice,
                            mrp: mrpPrice,
                            stock: productInfo.stock // Keep existing stock value
                        })

                        toast.success('Product information generated successfully!')
                    } else {
                        console.error('API error:', data.error)
                        toast.error(data.error || 'Failed to generate product information. Please try again.')
                    }
                } catch (innerError) {
                    console.error('Error in reader.onload:', innerError)
                    toast.error('Failed to process image for AI generation')
                } finally {
                    setAiLoading(false)
                }
            }
            
            reader.onerror = () => {
                console.error('FileReader error')
                toast.error('Failed to read image file')
                setAiLoading(false)
            }
            
            reader.readAsDataURL(imageFile)
        } catch (error) {
            console.error('AI generation error:', error)
            toast.error('Failed to generate product information')
            setAiLoading(false)
        }
    }

    const generateMockProductInfo = () => {
        const mockProducts = [
            { name: 'Premium Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals.', category: 'Electronics', price: 20000, mrp: 25000 },
            { name: 'Smart Fitness Watch', description: 'Advanced fitness tracking watch with heart rate monitoring, GPS, and water resistance. Track your health and fitness goals.', category: 'Electronics', price: 28000, mrp: 35000 },
            { name: 'Organic Cotton T-Shirt', description: 'Comfortable and sustainable organic cotton t-shirt. Available in various colors and sizes. Perfect for everyday wear.', category: 'Clothing', price: 6500, mrp: 8000 },
            { name: 'Ceramic Coffee Mug', description: 'Beautiful handcrafted ceramic coffee mug with elegant design. Perfect for your morning coffee or tea routine.', category: 'Home & Kitchen', price: 4000, mrp: 5000 },
            { name: 'Skincare Set', description: 'Complete skincare routine set including cleanser, toner, and moisturizer. Made with natural ingredients for healthy skin.', category: 'Beauty & Health', price: 10000, mrp: 12000 }
        ]
        
        const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)]
        
        setProductInfo({
            name: randomProduct.name,
            description: randomProduct.description,
            category: randomProduct.category,
            price: randomProduct.price,
            mrp: randomProduct.mrp,
            stock: productInfo.stock
        })
        
        toast.success('Sample product information generated!')
    }

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
            let imageUrl = null
            if (images[1]) {
                const fd = new FormData()
                fd.append('file', images[1])
                fd.append('type', 'product')
                
                try {
                    // Try simple upload first (handles bucket creation and RLS issues)
                    const uploadRes = await fetch('/api/upload/simple', { method: 'POST', body: fd })
                    const uploadData = await uploadRes.json()
                    
                    if (uploadRes.ok) {
                        imageUrl = uploadData.url
                        console.log('Image uploaded successfully:', imageUrl)
                    } else {
                        console.error('Simple upload failed:', uploadData.error)
                        
                        // Try original upload method
                        console.log('Trying original upload...')
                        const originalRes = await fetch('/api/upload', { method: 'POST', body: fd })
                        const originalData = await originalRes.json()
                        
                        if (originalRes.ok) {
                            imageUrl = originalData.url
                            console.log('Original upload successful:', imageUrl)
                        } else {
                            console.error('Original upload failed:', originalData.error)
                            
                            // Try fallback upload as last resort
                            console.log('Trying fallback upload...')
                            const fallbackRes = await fetch('/api/upload/fallback', { method: 'POST', body: fd })
                            const fallbackData = await fallbackRes.json()
                            
                            if (fallbackRes.ok) {
                                imageUrl = fallbackData.url
                                console.log('Fallback upload successful:', imageUrl)
                                toast.success('Image uploaded using fallback method')
                            } else {
                                console.error('All upload methods failed:', fallbackData.error)
                                toast.error('Image upload failed - continuing without image')
                            }
                        }
                    }
                } catch (err) {
                    console.error('Upload failed', err)
                    toast.error('Image upload failed - continuing without image')
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
                imageUrl
            }

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || 'Product added successfully!')
                // Reset form
                setProductInfo({
                    name: "",
                    description: "",
                    mrp: 0,
                    price: 0,
                    category: "",
                    stock: 0,
                })
                setImages({ 1: null, 2: null, 3: null, 4: null })
            } else {
                toast.error(data.error || 'Failed to add product. Please try again.')
            }
        } catch (error) {
            console.error('Error adding product:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

                <div htmlFor="" className="flex gap-3 mt-4">
                    {Object.keys(images).map((key) => (
                        <label key={key} htmlFor={`images${key}`} className="relative">
                            <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                            <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                            {key === '1' && images[key] && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        generateWithAI(images[key])
                                    }}
                                    disabled={aiLoading}
                                    className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition disabled:opacity-50 z-10"
                                    title="Generate product info with AI"
                                >
                                    {aiLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </label>
                    ))}
                </div>
                {images[1] && (
                    <div className="mt-2 text-sm text-blue-600">
                        💡 Tip: Click the AI button on the first image to auto-generate product information!
                        <br />
                        <button
                            type="button"
                            onClick={() => generateMockProductInfo()}
                            className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                            Generate Sample Product (Demo)
                        </button>
                    </div>
                )}

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
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
            </div>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Stock Quantity
                <input type="number" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="Enter stock quantity" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" />
            </label>

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <br />

            <button 
                type="submit"
                disabled={loading} 
                className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Adding Product...' : 'Add Product'}
            </button>
        </form>
    )
}