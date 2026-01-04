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
  category?: string
  metadata?: { colorvalues?: string[]; sizevalues?: string[]; brandvalues?: string[] }
}

type Category = {
  _id: string
  name: string
  displayName: string
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [p, setP] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [colorInput, setColorInput] = useState("")
  const [sizeInput, setSizeInput] = useState("")
  const [brandInput, setBrandInput] = useState("")

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories?activeOnly=true")
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

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
    fetchCategories()
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
        category: p.category || undefined,
        metadata: p.metadata,
      }),
    })
    await load()
  }

  async function del() {
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
    router.push("/dashboard/products")
  }

  function handleMetadataAdd(type: "colorvalues" | "sizevalues" | "brandvalues", input: string, setInput: React.Dispatch<React.SetStateAction<string>>) {
    if (input.trim() && p) {
      const newValues = input.split(',').map(v => v.trim()).filter(v => v !== "");
      setP((prev) => {
        if (!prev) return null
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            [type]: [...(prev.metadata?.[type] || []), ...newValues],
          },
        }
      })
      setInput("")
    }
  }

  function handleMetadataRemove(type: "colorvalues" | "sizevalues" | "brandvalues", valueToRemove: string) {
    if (p) {
      setP((prev) => {
        if (!prev) return null
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            [type]: (prev.metadata?.[type] || []).filter((v) => v !== valueToRemove),
          },
        }
      })
    }
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
          <label className="block text-sm mb-1">Category</label>
          <select
            className="input w-full"
            value={p.category || ""}
            onChange={(e) => setP({ ...p, category: e.target.value || undefined })}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.displayName}>
                {cat.displayName}
              </option>
            ))}
          </select>
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
          <label className="block text-sm mb-1">Colors (comma-separated or add one by one)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="Red, Blue, #FF00FF"
              className="h-10 px-3 rounded-md border bg-background flex-1"
            />
            <button
              type="button"
              onClick={() => handleMetadataAdd("colorvalues", colorInput, setColorInput)}
              className="h-10 px-3 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              ✓
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.metadata?.colorvalues?.map((c, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs">
                <span className="inline-block w-3 h-3 rounded-full border" style={{ backgroundColor: c }} />
                {c}
                <button type="button" onClick={() => handleMetadataRemove("colorvalues", c)} className="ml-1 text-red-500">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Sizes (comma-separated or add one by one)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              placeholder="S, M, L, XL"
              className="h-10 px-3 rounded-md border bg-background flex-1"
            />
            <button
              type="button"
              onClick={() => handleMetadataAdd("sizevalues", sizeInput, setSizeInput)}
              className="h-10 px-3 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              ✓
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.metadata?.sizevalues?.map((s, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs">
                {s}
                <button type="button" onClick={() => handleMetadataRemove("sizevalues", s)} className="ml-1 text-red-500">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Brands (comma-separated or add one by one)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              placeholder="BrandA, BrandB"
              className="h-10 px-3 rounded-md border bg-background flex-1"
            />
            <button
              type="button"
              onClick={() => handleMetadataAdd("brandvalues", brandInput, setBrandInput)}
              className="h-10 px-3 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              ✓
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.metadata?.brandvalues?.map((b, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs">
                {b}
                <button type="button" onClick={() => handleMetadataRemove("brandvalues", b)} className="ml-1 text-red-500">
                  ×
                </button>
              </span>
            ))}
          </div>
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
