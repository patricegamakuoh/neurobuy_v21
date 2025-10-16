export type ProductId = string;

export interface Product {
	id: ProductId;
	vendor_id: string | null;
	name: string;
	description: string | null;
	price: number; // stored in smallest currency unit (e.g., XAF)
	currency: string; // e.g., "XAF", "CNY"
	category: string | null;
	image_url: string | null;
	stock: number | null;
	status: "active" | "inactive";
	created_at: string;
}

export interface ProductListQuery {
	search?: string;
	category?: string;
	limit?: number;
	offset?: number;
}

