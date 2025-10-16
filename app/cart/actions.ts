"use client";
export async function checkout(items: { productId: string; name: string; price: number; quantity: number }[], currency: string) {
	const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, currency }) });
	if (!res.ok) {
		throw new Error((await res.json()).error || "Checkout failed");
	}
	return (await res.json()) as { ok: true; orderId: string };
}

