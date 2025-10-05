"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useProductStore, useProductActions } from "../../../lib/store"
import type { Product } from "../../../lib/types"
import AuthGuard from "../../../components/auth-guard"

export default function ProductDetailPage() {
  return (
    <AuthGuard>
      <DetailInner />
    </AuthGuard>
  )
}

function DetailInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const products = useProductStore((s) => s.products) as Product[]
  const { update, remove } = useProductActions()
  const product = useMemo(() => products.find((p) => p.id === params.id), [products, params.id])
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    inStock: product?.inStock?.toString() || "",
    description: product?.description || "",
  })

  if (!product) return <p className="text-sm text-muted">Product not found.</p>

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    update(product.id, {
      name: form.name,
      price: Number(form.price),
      inStock: Number(form.inStock),
      description: form.description,
    })
    alert("Saved.")
  }

  function onDelete() {
    if (confirm("Delete this product?")) {
      remove(product.id)
      router.replace("/products")
    }
  }

  return (
    <section className="grid gap-4 max-w-2xl">
      <h1 className="text-xl font-semibold">Edit Product</h1>
      <form onSubmit={onSave} className="bg-white border rounded-lg p-5 grid gap-3">
        <input
          className="h-10 px-3 rounded-md border bg-background"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="h-10 px-3 rounded-md border bg-background"
          type="number"
          step="0.01"
          name="price"
          value={form.price}
          onChange={handleChange}
        />
        <input
          className="h-10 px-3 rounded-md border bg-background"
          type="number"
          name="inStock"
          value={form.inStock}
          onChange={handleChange}
        />
        <textarea
          className="min-h-24 p-3 rounded-md border bg-background"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-md bg-primary text-white" type="submit">
            Save
          </button>
          <button className="h-10 px-4 rounded-md border" type="button" onClick={() => history.back()}>
            Back
          </button>
          <button className="h-10 px-4 rounded-md bg-red-600 text-white" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </form>
    </section>
  )
}
