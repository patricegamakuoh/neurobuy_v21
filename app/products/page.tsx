import Link from "next/link";
import { listProducts } from "@/lib/repositories/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
	const products = await listProducts({ search: searchParams?.q, category: searchParams?.category, limit: 24 });
	return (
		<div className="max-w-5xl mx-auto w-full p-5">
			<h1 className="text-2xl font-semibold mb-6">Products</h1>
			{products.length === 0 ? (
				<p className="text-sm text-muted-foreground">No products found.</p>
			) : (
				<ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{products.map((p) => (
						<li key={p.id} className="border rounded-md p-3 hover:shadow-sm transition">
							<Link href={`/products/${p.id}`} className="block">
								{p.image_url ? (
									<img src={p.image_url} alt={p.name} className="w-full h-36 object-cover rounded" />
								) : (
									<div className="w-full h-36 bg-muted rounded" />
								)}
								<div className="mt-3">
									<p className="font-medium truncate" title={p.name}>{p.name}</p>
									<p className="text-sm text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency || "XAF" }).format(p.price / 100)}</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

