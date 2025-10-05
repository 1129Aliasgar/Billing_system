"use client"

import { useActions, useStore } from "../../lib/store"
import { useState } from "react"

export default function SelectPage() {
  const products = useStore((s: any) => s.products)
  const { addItem } = useActions()
  const [productId, setProductId] = useState<string>(products[0]?.id ?? "")
  const [qty, setQty] = useState<number>(1)

  function onAdd() {
    const p = products.find((x: any) => x.id === productId)
    if (p) addItem(p, qty)
  }

  return (
    <section className="grid gap-4 max-w-xl">
      <h1 className="text-xl font-semibold">Select Items</h1>
      <div className="bg-white border rounded-lg p-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          Product
          <select
            className="h-10 px-3 rounded-md border bg-background"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Quantity
          <input
            className="h-10 px-3 rounded-md border bg-background"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </label>
        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded-md bg-primary text-white" onClick={onAdd}>
            Add to Bill
          </button>
        </div>
      </div>
      <p className="text-sm text-muted">Added items will appear on the Billing page.</p>
    </section>
  )
}
