import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
	const supabase = await createClient();
	const samples = [
		{
			name: "Wireless Earbuds",
			description: "Noise-cancelling, long battery life",
			price: 199900,
			currency: "XAF",
			category: "Electronics",
			image_url: "https://images.unsplash.com/photo-1585386959984-a4155223168f?w=800&q=80&auto=format&fit=crop",
			stock: 50,
			status: "active",
		},
		{
			name: "Travel Backpack",
			description: "Durable, water-resistant, 30L",
			price: 149900,
			currency: "XAF",
			category: "Accessories",
			image_url: "https://images.unsplash.com/photo-1520975682031-c3bfb92cdd2a?w=800&q=80&auto=format&fit=crop",
			stock: 25,
			status: "active",
		},
		{
			name: "Smart Watch",
			description: "Heart rate, GPS, notifications",
			price: 299900,
			currency: "XAF",
			category: "Electronics",
			image_url: "https://images.unsplash.com/photo-1518078320748-cf1e8e687a52?w=800&q=80&auto=format&fit=crop",
			stock: 30,
			status: "active",
		},
	];

	const { error } = await supabase.from("products").insert(samples);
	if (error) {
		return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
	}
	return NextResponse.json({ ok: true, inserted: samples.length });
}

