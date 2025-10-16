"use client";
import { useState } from "react";
import { addProductToCart } from "../actions";

export function AddToCartButton(props: { id: string; name: string; price: number; currency: string; imageUrl?: string | null }) {
	const [adding, setAdding] = useState(false);
	return (
		<button
			onClick={() => {
				setAdding(true);
				addProductToCart(props);
				setAdding(false);
			}}
			className="mt-6 border rounded px-4 py-2"
			disabled={adding}
		>
			{adding ? "Adding..." : "Add to cart"}
		</button>
	);
}

