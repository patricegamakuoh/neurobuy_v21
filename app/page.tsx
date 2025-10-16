import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>NeuroBuy</Link>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Link className="hover:underline" href="/products">Products</Link>
                <Link className="hover:underline" href="/cart">Cart</Link>
                <Link className="hover:underline" href="/dashboard/customer">Customer</Link>
                <Link className="hover:underline" href="/dashboard/vendor">Vendor</Link>
                <Link className="hover:underline" href="/dashboard/logistics">Logistics</Link>
                <Link className="hover:underline" href="/dashboard/admin">Admin</Link>
              </div>
            </div>
            <div className="text-xs">
              <Link href="/auth/login" className="hover:underline mr-3">Sign in</Link>
              <Link href="/auth/sign-up" className="hover:underline">Sign up</Link>
            </div>
          </div>
        </nav>

        <section className="w-full max-w-5xl p-6 text-center">
          <h1 className="text-3xl font-semibold">Multivendor E‑Commerce & Logistics</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Browse products, add to cart, checkout, track shipments, and manage storefronts.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/products" className="border rounded px-4 py-2">Browse Products</Link>
            <Link href="/cart" className="border rounded px-4 py-2">View Cart</Link>
          </div>
        </section>

        <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Customer</h2>
            <p className="text-sm text-muted-foreground">Orders, history, and tracking.</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Vendor</h2>
            <p className="text-sm text-muted-foreground">Manage products and storefront.</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Logistics</h2>
            <p className="text-sm text-muted-foreground">Update shipment statuses.</p>
          </div>
        </section>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-10">
          <p>Powered by Supabase · Built with Next.js</p>
        </footer>
      </div>
    </main>
  );
}
