"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Product = { id: string; name: string; price: number; inStock: number }

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [p, setP] = useState<Product | null>(null)

  useEffect(() => {
    const list: Product[] = JSON.parse(localStorage.getItem("admin_products") || "[]")
    setP(list.find((x) => x.id === id) || null)
  }, [id])

  function save(updated: Product) {
    const list: Product[] = JSON.parse(localStorage.getItem("admin_products") || "[]")
    const next = list.map((x) => (x.id === updated.id ? updated : x))
    localStorage.setItem("admin_products", JSON.stringify(next))
    setP(updated)
  }

  function del() {
    const list: Product[] = JSON.parse(localStorage.getItem("admin_products") || "[]")
    const next = list.filter((x) => x.id !== id)
    localStorage.setItem("admin_products", JSON.stringify(next))
    router.push("/dashboard/products")
  }

  if (!p) return <div>Loading...</div>

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Edit Product</h1>
      <div className="card space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Price (₹ paise)</label>
          <input
            type="number"
            className="input"
            value={p.price}
            onChange={(e) => setP({ ...p, price: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">In Stock</label>
          <input
            type="number"
            className="input"
            value={p.inStock}
            onChange={(e) => setP({ ...p, inStock: Number(e.target.value) })}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => save(p!)}>
            Save
          </button>
          <button className="btn-outline px-4 py-2 rounded" onClick={del}>
            Delete
          </button>
        </div>
      </div>
    </section>
  )
}
