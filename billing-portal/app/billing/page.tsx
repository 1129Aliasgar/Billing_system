"use client"

import BillSummary from "../../components/bill-summary"
import { bills as billsApi, useActions, useStore } from "../../lib/store"
import { useState, useEffect } from "react"
import AuthGuard from "../../components/auth-guard"
import type { Product } from "../../lib/types"

export default function BillingPage() {
  const { clearBill, addItem } = useActions()
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState<string>("")
  const [qty, setQty] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>("")

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
    const p = filteredProducts.find((x) => x._id === productId) || products.find((x) => x._id === productId)
    if (p && qty <= p.inStock) {
      addItem(p, qty)
      // Reset quantity after adding
      setQty(1)
    } else if (p && qty > p.inStock) {
      alert(`Insufficient stock. Available: ${p.inStock}`)
    }
  }

  function handleQtyChange(newQty: number) {
    const p = products.find((x) => x._id === productId)
    const maxQty = p ? p.inStock : 1
    setQty(Math.min(Math.max(1, newQty), maxQty))
  }

  // Filter products by search query (name or brand)
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const brandName = p.metadata?.brand?.[0] || p.metadata?.brandvalues?.[0] || ""
    return (
      p.name.toLowerCase().includes(query) ||
      brandName.toLowerCase().includes(query)
    )
  })

  // Reset productId if current selection is not in filtered list
  useEffect(() => {
    if (productId && !filteredProducts.find(p => p._id === productId)) {
      if (filteredProducts.length > 0) {
        setProductId(filteredProducts[0]._id)
      } else {
        setProductId("")
      }
    }
  }, [filteredProducts, productId])

  // Get display name with brand
  function getProductDisplayName(p: Product): string {
    const brandName = p.metadata?.brand?.[0] || p.metadata?.brandvalues?.[0]
    return brandName ? `${p.name} (${brandName})` : p.name
  }

  return (
    <AuthGuard>
      <section className="grid gap-4 pb-24">
        <h1 className="text-xl font-semibold">Billing</h1>

        {/* Product Selection Section at Top */}
        <div className="bg-white border rounded-lg p-4 grid gap-3">
          <h2 className="text-sm font-medium text-gray-700">Add Products</h2>
          <div className="grid gap-3">
            {/* Search Bar */}
            <label className="grid gap-1 text-sm">
              Search by Product Name or Brand
              <input
                type="text"
                placeholder="Search products or brands..."
                className="h-10 px-3 rounded-md border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="grid gap-1 text-sm">
                Product
                <select
                  className="h-10 px-3 rounded-md border bg-background"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  {filteredProducts.length === 0 ? (
                    <option value="">No products available</option>
                  ) : (
                    filteredProducts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {getProductDisplayName(p)} (Stock: {p.inStock})
                      </option>
                    ))
                  )}
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
            <div className="flex items-end">
              <button 
                className="h-10 px-4 rounded-md bg-primary text-white hover:opacity-90 w-full" 
                onClick={onAdd}
                disabled={!productId || products.length === 0}
              >
                Add to Bill
              </button>
            </div>
            {products.find(p => p._id === productId) && (
              <div className="flex items-end text-sm text-gray-600">
                Available: {products.find(p => p._id === productId)?.inStock || 0}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <BillSummary />

        {/* Action Buttons - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => clearBill()} 
                className="px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors"
              >
                Clear Bill
              </button>
              <button
                onClick={() => billsApi.saveBill()}
                className="px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors"
                style={{ minWidth: '140px' }}
              >
               Save Bill
              </button>
            </div>
          </div>
        </div>
      </section>
    </AuthGuard>
  )
}
