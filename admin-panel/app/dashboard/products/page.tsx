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
  category?: string
  image?: string
  HSNC_code?: string
  metadata?: { colorvalues?: string[]; sizevalues?: string[]; brandvalues?: string[] }
}

export default function ProductsList() {
  const [q, setQ] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products")
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach((p) => {
      if (p.category) {
        cats.add(p.category)
      }
    })
    return Array.from(cats).sort()
  }, [items])

  const filtered = useMemo(
    () => {
      let result = items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      if (selectedCategory !== "All Products") {
        result = result.filter((p) => p.category === selectedCategory)
      }
      return result
    },
    [items, q, selectedCategory]
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filtered.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [q])

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
        category: full.category || undefined,
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
        category: full.category || undefined,
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
        <CreateProductModal onProductCreated={fetchProducts} />
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Search by product name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="All Products">All Products</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 bg-[var(--color-muted)] text-sm font-medium p-2">
          <div className="text-left pl-2">Product Name</div>
          <div>In Stock</div>
          <div>Save</div>
          <div>Category</div>
          <div>Visible</div>
        </div>
        <ul className="divide-y">
          {currentItems.map((p) => (
            <li key={p._id} className="grid grid-cols-5 items-center p-2 gap-2">
              <div className="text-left">
                <Link href={`/dashboard/products/${p._id}`} className="text-[var(--color-primary)]">
                  {p.name}
                </Link>
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
              <div className="text-sm text-muted-foreground">
                {p.category || "—"}
              </div>
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
            </li>
          ))}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-2 rounded-md ${currentPage === page
                  ? "bg-primary text-white"
                  : "border hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal rendered via CreateProductModal */}
    </section>
  )
}
