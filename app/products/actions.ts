"use client";
import { addToCart } from "@/lib/cart/storage";

export function addProductToCart(params: { id: string; name: string; price: number; currency: string; imageUrl?: string | null }) {
	return addToCart({ productId: params.id, name: params.name, price: params.price, currency: params.currency, quantity: 1, imageUrl: params.imageUrl });
}

