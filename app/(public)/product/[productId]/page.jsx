'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true);

    const fetchProduct = async () => {
        try {
            // First try to fetch from database
            const response = await fetch(`/api/products/public`)
            if (response.ok) {
                const { products } = await response.json()
                const foundProduct = products.find((p) => p.id === productId);
                if (foundProduct) {
                    setProduct(foundProduct);
                    setLoading(false);
                    return;
                }
            }
            
            // If not found in database, check if it's a dummy product
            const dummyProducts = await import('@/assets/assets').then(module => module.productDummyData);
            const dummyProduct = dummyProducts.find((p) => p.id === productId);
            if (dummyProduct) {
                setProduct(dummyProduct);
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProduct()
        scrollTo(0, 0)
    }, [productId]);

    if (loading) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading product...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-20">
                        <h1 className="text-2xl font-semibold text-slate-600">Product not found</h1>
                        <p className="mt-2 text-slate-500">The product you're looking for doesn't exist.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}