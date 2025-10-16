import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function VendorDashboard() {
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
	const { data: products } = await supabase.from("products").select("id, name, price, currency, image_url").eq("vendor_id", userId).order("created_at", { ascending: false });
	return (
		<div className="max-w-5xl mx-auto w-full p-5">
			<h1 className="text-2xl font-semibold mb-6">Vendor Dashboard</h1>
			<div className="mb-4 text-sm text-muted-foreground">Your products</div>
			{!products || products.length === 0 ? (
				<p className="text-sm text-muted-foreground">No products yet.</p>
			) : (
				<ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{products.map((p) => (
						<li key={p.id} className="border rounded-md p-3">
							<Link href={`/products/${p.id}`} className="block">
								{p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover rounded" /> : <div className="w-full h-36 bg-muted rounded" />}
								<div className="mt-3">
									<p className="font-medium truncate" title={p.name}>{p.name}</p>
									<p className="text-sm text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency || "XAF" }).format((p.price || 0) / 100)}</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

