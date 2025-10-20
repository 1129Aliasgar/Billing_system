"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Product = {
  _id: string
  name: string
  discription?: string
  price: number
  inStock: number
  image: string
  HSNC_code: string
  IsVisible: boolean
  metadata?: { colorvalues?: string[]; sizevalues?: string[]; brandvalues?: string[] }
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [p, setP] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`)
      const data = await res.json()
      const product: Product = data?.product ?? data
      setP(product)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function save() {
    if (!p) return
    await fetch(`/api/products/${p._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({
        name: p.name,
        description: p.discription,
        price: p.price,
        inStock: p.inStock,
        image: p.image,
        HSN_code: p.HSNC_code,
        IsVisible: p.IsVisible,
        metadata: p.metadata,
      }),
    })
    await load()
  }

  async function del() {
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
    router.push("/dashboard/products")
  }

  if (loading || !p) return <div>Loading...</div>

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Edit Product</h1>
      <div className="card space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="input" value={p.discription || ""} onChange={(e) => setP({ ...p, discription: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Price</label>
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
        <div>
          <label className="block text-sm mb-1">Image URL</label>
          <input className="input" value={p.image} onChange={(e) => setP({ ...p, image: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">HSNC Code</label>
          <input className="input" value={p.HSNC_code} onChange={(e) => setP({ ...p, HSNC_code: e.target.value })} />
        </div>
        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.IsVisible}
              onChange={(e) => setP({ ...p, IsVisible: e.target.checked })}
            />
            Visible
          </label>
        </div>
        <div>
          <label className="block text-sm mb-1">Colors (comma separated)</label>
          <input
            className="input"
            value={(p.metadata?.colorvalues || []).join(", ")}
            onChange={(e) => setP({ ...p, metadata: { ...p.metadata, colorvalues: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={save}>
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
