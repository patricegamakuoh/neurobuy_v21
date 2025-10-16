import Link from "next/link";
import { getProductById } from "@/lib/repositories/products";
import { AddToCartButton } from "./AddToCartButton";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
	const product = await getProductById(params.id);
	if (!product) {
		return (
			<div className="max-w-3xl mx-auto w-full p-5">
				<p className="text-sm text-muted-foreground">Product not found.</p>
				<Link href="/products" className="underline text-sm mt-4 inline-block">Back to products</Link>
			</div>
		);
	}
	return (
		<div className="max-w-3xl mx-auto w-full p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				{product.image_url ? (
					<img src={product.image_url} alt={product.name} className="w-full h-80 object-cover rounded" />
				) : (
					<div className="w-full h-80 bg-muted rounded" />
				)}
			</div>
			<div>
				<h1 className="text-2xl font-semibold">{product.name}</h1>
				<p className="text-sm text-muted-foreground mt-2">{product.description || "No description."}</p>
				<p className="text-lg font-medium mt-4">
					{new Intl.NumberFormat(undefined, { style: "currency", currency: product.currency || "XAF" }).format(product.price / 100)}
				</p>
				<AddToCartButton id={product.id} name={product.name} price={product.price} currency={product.currency || "XAF"} imageUrl={product.image_url} />
			</div>
		</div>
	);
}

