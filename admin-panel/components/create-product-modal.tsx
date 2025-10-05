"use client"

import type React from "react"

import { useState } from "react"
import { useProductActions } from "../lib/store"

export default function CreateProductModal() {
  const [open, setOpen] = useState(false)
  const { create } = useProductActions()
  const [form, setForm] = useState({ name: "", price: "", inStock: "", description: "" })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = Number(form.price || 0)
    const inStock = Number(form.inStock || 0)
    create({ name: form.name, price, inStock, description: form.description })
    setOpen(false)
    setForm({ name: "", price: "", inStock: "", description: "" })
  }

  return (
    <>
      <button className="h-9 px-3 rounded-md bg-primary text-white" onClick={() => setOpen(true)}>
        Create Product
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <form onSubmit={onSubmit} className="bg-white rounded-lg w-full max-w-md p-5 grid gap-3">
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
              name="description"
              placeholder="Description"
              className="min-h-24 p-3 rounded-md border bg-background"
              value={form.description}
              onChange={handleChange}
            />
            <div className="flex items-center justify-end gap-2">
              <button type="button" className="h-9 px-3 rounded-md border" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="h-9 px-3 rounded-md bg-primary text-white">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
