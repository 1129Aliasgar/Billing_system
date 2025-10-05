"use client"

import { useActions, useStore } from "../../lib/store"

export default function BillingProductsPage() {
  const products = useStore((s: any) => s.products)
  const { addItem } = useActions()

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <p className="text-sm text-muted">Add items to your selection</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p: any) => (
          <div key={p.id} className="bg-white border rounded-lg p-4 grid gap-2">
            <img
              src={`/placeholder.svg?height=140&width=240&query=billing-product`}
              alt={`Image of ${p.name}`}
              className="w-full h-36 object-cover rounded-md"
            />
            <h3 className="font-medium">{p.name}</h3>
            <p className="text-sm text-muted">${p.price.toFixed(2)}</p>
            <button className="h-9 px-3 rounded-md bg-primary text-white" onClick={() => addItem(p, 1)}>
              Add
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
