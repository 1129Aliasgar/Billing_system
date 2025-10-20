"use client"
import { useEffect , useState} from "react"
import AuthGuard from "../../components/auth-guard"
import { Product } from "../../lib/types"

export default function BillingProductsPage() {

  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch("/api/products", { cache: "no-store" })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : data?.products || [])
    } finally {
      setLoading(false)
    }
  }

  async function toggleBillingAvailable(productId: string, currentValue: boolean) {
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: productId,
          data: { ISBillingAvailable: !currentValue }
        }),
      })
      if (res.ok) {
        setItems(prev => prev.map(p => 
          p._id === productId ? { ...p, ISBillingAvailable: !currentValue } : p
        ))
      }
    } catch (err) {
      console.error("Error updating billing availability:", err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (loading) {
    return (
      <section className="grid gap-6">
        <header className="grid gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-balance">Products</h1>
          <p className="">Loading products…</p>
        </header>
      </section>
    )
  }

  return (
    <AuthGuard>
      <section className="grid gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted">Add items to your selection</p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {currentItems.map((p: Product) => (
            <div key={p._id} className="bg-white border rounded-lg p-4 grid gap-2">
              <img
                src={p.image || `/placeholder.svg?height=140&width=240&query=billing-product`}
                alt={`Image of ${p.name}`}
                className="w-full h-36 object-cover rounded-md"
              />
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-muted">${p.price.toFixed(2)}</p>
              <button 
                className={`h-9 px-3 rounded-md text-white ${
                  (p as any).ISBillingAvailable 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={() => toggleBillingAvailable(p._id, (p as any).ISBillingAvailable || false)}
              >
                {(p as any).ISBillingAvailable ? "Remove from Billing" : "Add to Billing"}
              </button>
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </AuthGuard>
  )
}
