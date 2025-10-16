"use client";
import { useEffect, useState } from "react";
import { readCart, updateQuantity, removeFromCart, clearCart } from "@/lib/cart/storage";
import { checkout } from "./actions";

export default function CartPage() {
	const [items, setItems] = useState(readCart());
	useEffect(() => {
		setItems(readCart());
	}, []);
	const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
	const currency = items[0]?.currency || "XAF";
	return (
		<div className="max-w-3xl mx-auto w-full p-5">
			<h1 className="text-2xl font-semibold mb-6">Cart</h1>
			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">Your cart is empty.</p>
			) : (
				<div className="space-y-4">
					{items.map((i) => (
						<div key={i.productId} className="flex items-center gap-4 border rounded p-3">
							{ i.imageUrl ? <img src={i.imageUrl} alt={i.name} className="w-16 h-16 object-cover rounded"/> : <div className="w-16 h-16 bg-muted rounded"/> }
							<div className="flex-1">
								<p className="font-medium">{i.name}</p>
								<p className="text-sm text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency }).format(i.price / 100)}</p>
							</div>
							<input
								type="number"
								min={1}
								value={i.quantity}
								onChange={(e) => setItems(updateQuantity(i.productId, Number(e.target.value) || 1))}
								className="w-20 border rounded px-2 py-1"
							/>
							<button className="border rounded px-3 py-1" onClick={() => setItems(removeFromCart(i.productId))}>Remove</button>
						</div>
					))}
					<div className="flex items-center justify-between border-t pt-4">
						<p className="font-medium">Total</p>
						<p className="font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total / 100)}</p>
					</div>
					<div className="flex gap-3">
						<button className="border rounded px-4 py-2" onClick={() => setItems([]) || clearCart()}>Clear</button>
						<button
							className="border rounded px-4 py-2"
							onClick={async () => {
								try {
									const res = await checkout(items.map(({ productId, name, price, quantity }) => ({ productId, name, price, quantity })), currency);
									alert(`Order created: ${res.orderId}`);
									setItems([]);
									clearCart();
								} catch (e: any) {
									alert(e.message || "Checkout failed");
								}
							}}
						>
							Checkout
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

