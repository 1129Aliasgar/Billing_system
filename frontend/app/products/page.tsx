"use client"

import { useEffect, useState } from "react"
import ProductCard from "../../components/product-card"
import { Product } from "../../lib/products"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products?visible=true`)
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="grid gap-6">
        <header className="grid gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-balance">Products</h1>
          <p className="">Loading products…</p>
        </header>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Products</h1>
        <p className="">Browse our curated selection.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={{
              _id: p._id,
              name: p.name,
              description: p.description,
              price: p.price || 0,
              inStock: p.inStock || 0,
              image: p.image || "",
            }}
          />
        ))}
        {products.length === 0 && (
          <div className="text-sm text-gray-500">No products available.</div>
        )}
      </div>
    </section>
  )
}
