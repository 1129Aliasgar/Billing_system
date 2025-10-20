"use client"

import type React from "react"

import { useState } from "react"

export default function CreateProductModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    discription: "",
    price: "",
    inStock: "",
    image: "",
    HSNC_code: "",
    IsVisible: true,
    colorvalues: "",
    sizevalues: "",
    brandvalues: "",
  })
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        description: form.discription,
        price: Number(form.price || 0),
        inStock: Number(form.inStock || 0),
        image: form.image,
        HSN_code: form.HSNC_code,
        IsVisible: Boolean(form.IsVisible),
        metadata: {
          colorvalues: colors.length ? colors : (form.colorvalues ? form.colorvalues.split(",").map((s) => s.trim()).filter(Boolean) : []),
          sizevalues: sizes.length ? sizes : (form.sizevalues ? form.sizevalues.split(",").map((s) => s.trim()).filter(Boolean) : []),
          brandvalues: brands.length ? brands : (form.brandvalues ? form.brandvalues.split(",").map((s) => s.trim()).filter(Boolean) : []),
        },
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to create product")
      setOpen(false)
      setForm({
        name: "",
        discription: "",
        price: "",
        inStock: "",
        image: "",
        HSNC_code: "",
        IsVisible: true,
        colorvalues: "",
        sizevalues: "",
        brandvalues: "",
      })
      setColors([]); setSizes([]); setBrands([])
    } catch (err) {
      console.error(err)
      alert("Error creating product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="h-9 px-3 rounded-md bg-primary text-white" onClick={() => setOpen(true)}>
        Create Product
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <form onSubmit={onSubmit} className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-5 grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">New Product</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <input
              name="name"
              required
              placeholder="Name"
              className="h-10 px-3 rounded-md border bg-background"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="price"
              required
              type="number"
              step="0.01"
              placeholder="Price"
              className="h-10 px-3 rounded-md border bg-background"
              value={form.price}
              onChange={handleChange}
            />
            <input
              name="inStock"
              required
              type="number"
              placeholder="In Stock"
              className="h-10 px-3 rounded-md border bg-background"
              value={form.inStock}
              onChange={handleChange}
            />
            <textarea
              name="discription"
              placeholder="Description"
              className="min-h-24 p-3 rounded-md border bg-background"
              value={form.discription}
              onChange={handleChange}
            />
            <input
              name="image"
              required
              placeholder="Image URL"
              className="h-10 px-3 rounded-md border bg-background"
              value={form.image}
              onChange={handleChange}
            />
            <input
              name="HSNC_code"
              required
              placeholder="HSNC Code"
              className="h-10 px-3 rounded-md border bg-background"
              value={form.HSNC_code}
              onChange={handleChange}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="IsVisible"
                checked={form.IsVisible}
                onChange={(e) => setForm((f) => ({ ...f, IsVisible: e.target.checked }))}
              />
              Visible
            </label>
            <div className="grid gap-2">
              <div className="flex gap-2">
                <input
                  name="colorvalues"
                  placeholder="Add color and press ✓ or use commas"
                  className="h-10 px-3 rounded-md border bg-background flex-1"
                  value={form.colorvalues}
                  onChange={handleChange}
                />
                <button type="button" className="h-10 px-3 rounded-md border" onClick={() => {
                  const vals = (form.colorvalues || "").split(",").map((s)=>s.trim()).filter(Boolean)
                  if (!vals.length) return
                  setColors((prev)=> Array.from(new Set([...prev, ...vals])))
                  setForm((f)=> ({...f, colorvalues: ""}))
                }}>✓</button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {colors.map((c, i)=>(
                    <span key={`${c}-${i}`} className="inline-flex items-center gap-1 text-xs border rounded px-2 py-1">
                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c }} />{c}
                      <button type="button" onClick={() => setColors((prev)=> prev.filter((x)=> x!==c))}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex gap-2">
                <input
                  name="sizevalues"
                  placeholder="Add size and press ✓ or use commas"
                  className="h-10 px-3 rounded-md border bg-background flex-1"
                  value={form.sizevalues}
                  onChange={handleChange}
                />
                <button type="button" className="h-10 px-3 rounded-md border" onClick={() => {
                  const vals = (form.sizevalues || "").split(",").map((s)=>s.trim()).filter(Boolean)
                  if (!vals.length) return
                  setSizes((prev)=> Array.from(new Set([...prev, ...vals])))
                  setForm((f)=> ({...f, sizevalues: ""}))
                }}>✓</button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s, i)=>(
                    <span key={`${s}-${i}`} className="inline-flex items-center gap-1 text-xs border rounded px-2 py-1">
                      {s}
                      <button type="button" onClick={() => setSizes((prev)=> prev.filter((x)=> x!==s))}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex gap-2">
                <input
                  name="brandvalues"
                  placeholder="Add brand and press ✓ or use commas"
                  className="h-10 px-3 rounded-md border bg-background flex-1"
                  value={form.brandvalues}
                  onChange={handleChange}
                />
                <button type="button" className="h-10 px-3 rounded-md border" onClick={() => {
                  const vals = (form.brandvalues || "").split(",").map((s)=>s.trim()).filter(Boolean)
                  if (!vals.length) return
                  setBrands((prev)=> Array.from(new Set([...prev, ...vals])))
                  setForm((f)=> ({...f, brandvalues: ""}))
                }}>✓</button>
              </div>
              {brands.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {brands.map((b, i)=>(
                    <span key={`${b}-${i}`} className="inline-flex items-center gap-1 text-xs border rounded px-2 py-1">
                      {b}
                      <button type="button" onClick={() => setBrands((prev)=> prev.filter((x)=> x!==b))}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" className="h-9 px-3 rounded-md border" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button disabled={loading} type="submit" className="h-9 px-3 rounded-md bg-primary text-white">
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
