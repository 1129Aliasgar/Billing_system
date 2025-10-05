"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import SearchBar from "../../components/search-bar"
import CreateProductModal from "../../components/create-product-modal"
import AuthGuard from "../../components/auth-guard"
import { useProductStore, useProductActions } from "../../lib/store"
import type { Product } from "../../lib/types"

export default function ProductsListPage() {
  return (
    <AuthGuard>
      <ProductsInner />
    </AuthGuard>
  )
}

function ProductsInner() {
  const { seedIfEmpty, update } = useProductActions()
  const products = useProductStore((s) => s.products) as Product[]
  const [q, setQ] = useState("")

  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return products
    return products.filter((p) => p.name.toLowerCase().includes(term))
  }, [products, q])

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          <SearchBar value={q} onChange={setQ} />
          <CreateProductModal />
        </div>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {filtered.length === 0 && <p className="p-4 text-sm text-muted">No products found.</p>}
        {filtered.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">In stock:</span>
              <input
                className="h-9 w-24 px-3 rounded-md border bg-background"
                type="number"
                value={p.inStock}
                onChange={(e) => update(p.id, { inStock: Number(e.target.value) })}
                aria-label={`Edit stock for ${p.name}`}
              />
            </div>
            <Link href={`/products/${p.id}`} className="text-sm text-primary hover:underline">
              {p.name}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
