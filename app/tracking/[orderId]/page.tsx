import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: { orderId: string } }) {
	const supabase = await (await import("@/lib/supabase/server")).createClient();
	const { data: order } = await supabase.from("orders").select("id, status, created_at").eq("id", params.orderId).single();
	const { data: shipment } = await supabase.from("shipments").select("current_status, updated_at, logistics_id").eq("order_id", params.orderId).maybeSingle?.() || { data: null } as any;
	return (
		<div className="max-w-3xl mx-auto w-full p-5">
			<h1 className="text-2xl font-semibold mb-4">Order Tracking</h1>
			{!order ? (
				<p className="text-sm text-muted-foreground">Order not found.</p>
			) : (
				<div className="space-y-2">
					<p className="text-sm">Order ID: <span className="font-mono">{order.id}</span></p>
					<p className="text-sm">Order Status: {order.status}</p>
					<p className="text-sm">Shipment Status: {shipment?.current_status || "processing"}</p>
					<p className="text-xs text-muted-foreground">Updated: {shipment?.updated_at || order.created_at}</p>
				</div>
			)}
		</div>
	);
}

