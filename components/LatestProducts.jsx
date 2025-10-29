'use client'
import React, { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'

const LatestProducts = () => {

    const displayQuantity = 4
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products/public')
            if (response.ok) {
                const { products } = await response.json()
                setProducts(products || [])
            } else {
                console.error('Failed to fetch products')
                setProducts([])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className='px-6 my-30 max-w-6xl mx-auto'>
                <Title title='Latest Products' description="Loading products..." href='/shop' />
                <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                    {Array(4).fill(0).map((_, index) => (
                        <div key={index} className="w-full sm:w-60 h-80 bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {products.length > 0 ? (
                    products.slice().sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)).slice(0, displayQuantity).map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))
                ) : (
                    <div className="col-span-2 text-center py-12">
                        <p className="text-slate-500">No products available yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LatestProducts