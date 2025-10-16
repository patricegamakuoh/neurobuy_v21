export interface CartItem {
	productId: string;
	name: string;
	price: number; // smallest currency unit
	currency: string;
	quantity: number;
	imageUrl?: string | null;
}

const KEY = "nb_cart_v1";

export function readCart(): CartItem[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}

export function writeCart(items: CartItem[]): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
	const items = readCart();
	const existing = items.find((i) => i.productId === item.productId);
	if (existing) {
		existing.quantity += item.quantity;
		writeCart(items);
		return items;
	}
	const next = [...items, item];
	writeCart(next);
	return next;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
	const items = readCart().map((i) => (i.productId === productId ? { ...i, quantity } : i));
	writeCart(items);
	return items;
}

export function removeFromCart(productId: string): CartItem[] {
	const items = readCart().filter((i) => i.productId !== productId);
	writeCart(items);
	return items;
}

export function clearCart(): void {
	writeCart([]);
}

