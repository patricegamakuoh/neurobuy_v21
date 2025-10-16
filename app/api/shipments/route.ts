import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
	const supabase = await createClient();
	const body = await request.json().catch(() => null);
	if (!body || !body.orderId || !body.current_status) {
		return NextResponse.json({ ok: false, error: "orderId and current_status required" }, { status: 400 });
	}
	const { orderId, current_status } = body as { orderId: string; current_status: string };
	const { data: existing } = await supabase.from("shipments").select("id").eq("order_id", orderId).maybeSingle?.() || { data: null } as any;
	let error = null;
	if (!existing) {
		const res = await supabase.from("shipments").insert({ order_id: orderId, current_status });
		error = res.error;
	} else {
		const res = await supabase.from("shipments").update({ current_status, updated_at: new Date().toISOString() }).eq("order_id", orderId);
		error = res.error;
	}
	if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
	return NextResponse.json({ ok: true });
}

