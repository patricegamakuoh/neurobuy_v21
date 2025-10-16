import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const supabase = await createClient();
	const body = await request.json().catch(() => null);
	if (!body || !Array.isArray(body.items) || body.items.length === 0) {
		return NextResponse.json({ ok: false, error: "Invalid items" }, { status: 400 });
	}
	const { items, currency = "XAF" } = body as { items: { productId: string; name: string; price: number; quantity: number }[]; currency?: string };
	const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

	const { data: userRes } = await supabase.auth.getUser();
	const userId = userRes.user?.id || null;
	if (!userId) {
		return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
	}

	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert({ user_id: userId, status: "pending", total_price: total, currency })
		.select("id")
		.single();
	if (orderError) {
		return NextResponse.json({ ok: false, error: orderError.message }, { status: 500 });
	}

	const orderItems = items.map((i) => ({ order_id: order.id, product_id: i.productId, name: i.name, quantity: i.quantity, unit_price: i.price, currency }));
	const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
	if (itemsError) {
		return NextResponse.json({ ok: false, error: itemsError.message }, { status: 500 });
	}

	return NextResponse.json({ ok: true, orderId: order.id });
}

