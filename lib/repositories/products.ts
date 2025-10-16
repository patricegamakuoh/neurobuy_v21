import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Product, ProductId, ProductListQuery } from "@/lib/types/product";

export async function listProducts(query: ProductListQuery = {}): Promise<Product[]> {
	const supabase = await createServerClient();
	let req = supabase.from("products").select("*").order("created_at", { ascending: false });
	if (query.search) {
		req = req.ilike("name", `%${query.search}%`);
	}
	if (query.category) {
		req = req.eq("category", query.category);
	}
	if (typeof query.limit === "number") {
		req = req.limit(query.limit);
	}
	if (typeof query.offset === "number") {
		req = req.range(query.offset, (query.offset || 0) + (query.limit || 20) - 1);
	}
	const { data, error } = await req;
	if (error) throw error;
	return (data as Product[]) || [];
}

export async function getProductById(id: ProductId): Promise<Product | null> {
	const supabase = await createServerClient();
	const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
	if (error) {
		if ((error as any).code === "PGRST116") return null; // not found
		throw error;
	}
	return data as Product;
}

