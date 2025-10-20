"use client"

import { useActions, useStore } from "../../lib/store"
import { useState, useEffect } from "react"
import AuthGuard from "../../components/auth-guard"

export default function SelectPage() {
  const [products, setProducts] = useState<any[]>([])
  const { addItem } = useActions()
  const [productId, setProductId] = useState<string>("")
  const [qty, setQty] = useState<number>(1)

  async function fetchBillingProducts() {
    try {
      const res = await fetch("/api/products?billing=true", { cache: "no-store" })
      const data = await res.json()
      const billingProducts = Array.isArray(data) ? data : data?.products || []
      setProducts(billingProducts)
      if (billingProducts.length > 0 && !productId) {
        setProductId(billingProducts[0]._id)
      }
    } catch (err) {
      console.error("Error fetching billing products:", err)
    }
  }

  useEffect(() => {
    fetchBillingProducts()
  }, [])

  function onAdd() {
    const p = products.find((x: any) => x._id === productId)
    if (p && qty <= p.inStock) addItem(p, qty)
  }

  function handleQtyChange(newQty: number) {
    const p = products.find((x: any) => x._id === productId)
    const maxQty = p ? p.inStock : 1
    setQty(Math.min(Math.max(1, newQty), maxQty))
  }

  return (
    <AuthGuard>
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
                <option key={p._id} value={p._id}>
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
              max={products.find(p => p._id === productId)?.inStock || 1}
              value={qty}
              onChange={(e) => handleQtyChange(Number(e.target.value))}
            />
          </label>
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 rounded-md bg-primary text-white" onClick={onAdd}>
              Add to Bill
            </button>
          </div>
        </div>
        <p className="text-sm text-muted">
          Added items will appear on the Billing page. 
          {products.find(p => p._id === productId) && (
            <span className="block mt-1">
              Available stock: {products.find(p => p._id === productId)?.inStock || 0}
            </span>
          )}
        </p>
      </section>
    </AuthGuard>
  )
}
