"use client"

import { useEffect, useState } from "react"
import ProductCard from "../../components/product-card"
import { Product } from "../../lib/products"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products?visible=true`)
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

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
    <section className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Products</h1>
        <p className="">Browse our curated selection.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {currentProducts.map((p) => (
          <ProductCard
            key={p._id}
            product={{
              _id: p._id,
              name: p.name,
              description: p.description,
              price: p.price || 0,
              inStock: p.inStock || 0,
              image: p.image || "",
            }}
          />
        ))}
        {products.length === 0 && (
          <div className="text-sm text-gray-500">No products available.</div>
        )}
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
  )
}
