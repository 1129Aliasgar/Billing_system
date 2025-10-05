"use client"
import { useEffect, useMemo, useState } from "react"
import type React from "react"

import Link from "next/link"

type Product = { id: string; name: string; price: number; inStock: number }

function load(): Product[] {
  if (typeof window === "undefined") return []
  const existing = localStorage.getItem("admin_products")
  if (existing) return JSON.parse(existing)
  const seed: Product[] = [
    { id: "p-1", name: "Wireless Headphones", price: 299900, inStock: 42 },
    { id: "p-2", name: "Mechanical Keyboard", price: 499900, inStock: 18 },
    { id: "p-3", name: "4K Monitor", price: 1999900, inStock: 7 },
  ]
  localStorage.setItem("admin_products", JSON.stringify(seed))
  return seed
}

export default function ProductsList() {
  const [q, setQ] = useState("")
  const [items, setItems] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", price: "", inStock: "" })

  useEffect(() => {
    setItems(load())
  }, [])

  const filtered = useMemo(() => items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [items, q])

  function save(next: Product[]) {
    setItems(next)
    localStorage.setItem("admin_products", JSON.stringify(next))
  }

  function updateStock(id: string, value: number) {
    const next = items.map((p) => (p.id === id ? { ...p, inStock: value } : p))
    save(next)
  }

  function createProduct(e: React.FormEvent) {
    e.preventDefault()
    const newP: Product = {
      id: crypto.randomUUID(),
      name: form.name,
      price: Number(form.price || 0),
      inStock: Number(form.inStock || 0),
    }
    save([newP, ...items])
    setForm({ name: "", price: "", inStock: "" })
    setOpen(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <button className="btn" onClick={() => setOpen(true)}>
          Create Product
        </button>
      </div>
      <input
        className="input"
        placeholder="Search by product name..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 bg-[var(--color-muted)] text-sm font-medium p-2">
          <div>In Stock (editable)</div>
          <div className="text-right pr-2">Product Name</div>
        </div>
        <ul className="divide-y">
          {filtered.map((p) => (
            <li key={p.id} className="grid grid-cols-2 items-center p-2">
              <div>
                <input
                  type="number"
                  className="input max-w-24"
                  value={p.inStock}
                  onChange={(e) => updateStock(p.id, Number(e.target.value))}
                />
              </div>
              <div className="text-right">
                <Link href={`/dashboard/products/${p.id}`} className="text-[var(--color-primary)]">
                  {p.name}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center">
          <form className="card w-full max-w-sm space-y-3" onSubmit={createProduct}>
            <h2 className="text-lg font-semibold">Create Product</h2>
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Price (₹ paise)</label>
              <input
                type="number"
                className="input"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">In Stock</label>
              <input
                type="number"
                className="input"
                value={form.inStock}
                onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline px-3 py-2 rounded" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn">Create</button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
