import { createClient } from "@/lib/supabase/server";

export default async function CustomerDashboard() {
	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getUser();
	const userId = auth.user?.id;
	if (!userId) {
		return (
			<div className="max-w-4xl mx-auto w-full p-5">
				<p className="text-sm text-muted-foreground">Please sign in to view your dashboard.</p>
			</div>
		);
	}
	const { data: orders } = await supabase
		.from("orders")
		.select("id, status, total_price, currency, created_at")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(20);
	return (
		<div className="max-w-4xl mx-auto w-full p-5">
			<h1 className="text-2xl font-semibold mb-6">Customer Dashboard</h1>
			{!orders || orders.length === 0 ? (
				<p className="text-sm text-muted-foreground">No recent orders.</p>
			) : (
				<table className="w-full text-sm border rounded">
					<thead>
						<tr className="text-left">
							<th className="p-2">Order</th>
							<th className="p-2">Status</th>
							<th className="p-2">Total</th>
							<th className="p-2">Date</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((o) => (
							<tr key={o.id} className="border-t">
								<td className="p-2 font-mono">{o.id}</td>
								<td className="p-2">{o.status}</td>
								<td className="p-2">{new Intl.NumberFormat(undefined, { style: "currency", currency: o.currency || "XAF" }).format((o.total_price || 0) / 100)}</td>
								<td className="p-2">{new Date(o.created_at as any).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

