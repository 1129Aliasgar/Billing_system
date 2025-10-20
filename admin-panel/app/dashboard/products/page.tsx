"use client"
import { useEffect, useMemo, useState } from "react"
import type React from "react"

import Link from "next/link"
import CreateProductModal from "../../../components/create-product-modal"

type Product = {
  _id: string
  name: string
  price: number
  inStock: number
  IsVisible: boolean
  image?: string
  HSNC_code?: string
  metadata?: { colorvalues?: string[]; sizevalues?: string[]; brandvalues?: string[] }
}

export default function ProductsList() {
  const [q, setQ] = useState("")
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch("/api/products", { cache: "no-store" })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : data?.products || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filtered = useMemo(
    () => items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  )

  async function getFullProduct(id: string) {
    const res = await fetch(`/api/products/${id}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.product || data
  }

  async function putProduct(id: string, body: any) {
    const token = localStorage.getItem("token") || ""
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    return res
  }

  async function toggleVisibility(id: string, next: boolean) {
    const full = await getFullProduct(id)
    if (!full) return
    setSavingId(id)
    try {
      await putProduct(id, {
        name: full.name,
        description: full.discription ?? full.description ?? "",
        price: full.price,
        inStock: full.inStock,
        image: full.image || "",
        HSN_code: full.HSNC_code || full.HSN_code || "",
        IsVisible: next,
        metadata: full.metadata || {},
      })
      setItems((prev) => prev.map((p) => (p._id === id ? { ...p, IsVisible: next } : p)))
    } finally {
      setSavingId(null)
    }
  }

  async function saveStock(id: string, nextStock: number) {
    const full = await getFullProduct(id)
    if (!full) return
    setSavingId(id)
    try {
      await putProduct(id, {
        name: full.name,
        description: full.discription ?? full.description ?? "",
        price: full.price,
        inStock: nextStock,
        image: full.image || "",
        HSN_code: full.HSNC_code || full.HSN_code || "",
        IsVisible: full.IsVisible,
        metadata: full.metadata || {},
      })
      setItems((prev) => prev.map((p) => (p._id === id ? { ...p, inStock: nextStock } : p)))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <CreateProductModal />
      </div>
      <input
        className="input"
        placeholder="Search by product name..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-[var(--color-muted)] text-sm font-medium p-2">
          <div>Visible</div>
          <div>In Stock</div>
          <div>Save</div>
          <div className="text-right pr-2">Product Name</div>
        </div>
        <ul className="divide-y">
          {filtered.map((p) => (
            <li key={p._id} className="grid grid-cols-4 items-center p-2 gap-2">
              <div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={p.IsVisible}
                    disabled={savingId === p._id}
                    onChange={(e) => toggleVisibility(p._id, e.target.checked)}
                  />
                  {p.IsVisible ? "Visible" : "Hidden"}
                </label>
              </div>
              <div>
                <input
                  type="number"
                  className="input max-w-28"
                  defaultValue={p.inStock}
                  onChange={(e) => setItems((prev) => prev.map((x) => (x._id === p._id ? { ...x, inStock: Number(e.target.value || 0) } : x)))}
                />
              </div>
              <div>
                <button
                  className="btn"
                  disabled={savingId === p._id}
                  onClick={() => saveStock(p._id, p.inStock)}
                >
                  {savingId === p._id ? "Saving…" : "Save"}
                </button>
              </div>
              <div className="text-right">
                <Link href={`/dashboard/products/${p._id}`} className="text-[var(--color-primary)]">
                  {p.name}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Modal rendered via CreateProductModal */}
    </section>
  )
}
