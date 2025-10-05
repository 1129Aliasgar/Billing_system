import ProductCard from "../../components/product-card"
import { getProducts } from "../../lib/products"

export default async function ProductsPage() {
  const items = await getProducts()
  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Products</h1>
        <p className="">Browse our curated selection.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
