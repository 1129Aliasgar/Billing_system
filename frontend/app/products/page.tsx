"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import ProductCard from "../../components/product-card"
import { Product } from "../../lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel } from "@/components/ui/carousel"
import { ProductFilters } from "@/components/product-filters"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

// Static carousel data
const carouselItems = [
  {
    id: 1,
    title: "Premium Automotive Electrical Solutions",
    description: "Quality products for reliable vehicle performance",
    bgColor: "#579BB1",
  },
  {
    id: 2,
    title: "Expert Installation & Support",
    description: "Professional service you can trust",
    bgColor: "#4A8A9E",
  },
  {
    id: 3,
    title: "Wide Range of Products",
    description: "Everything you need for your automotive electrical needs",
    bgColor: "#6BA8BC",
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const itemsPerPage = 12

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories?activeOnly=true")
      if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)
      const data = await res.json()
      const categoryNames = Array.isArray(data.categories) 
        ? data.categories.map((cat: any) => cat.displayName || cat.name)
        : []
      setCategories(categoryNames)
    } catch (err) {
      console.error("Error fetching categories:", err)
      // Fallback: extract from products if API fails
      const cats = new Set<string>()
      products.forEach((p: any) => {
        if (p.category) {
          cats.add(p.category)
        }
      })
      setCategories(Array.from(cats).sort())
    }
  }

  async function fetchProducts() {
    try {
      const url = selectedCategory 
        ? `/api/products?visible=true&category=${encodeURIComponent(selectedCategory)}`
        : `/api/products?visible=true`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
      setCurrentPage(1) // Reset to first page when filter changes
    } catch (err) {
      console.error("Error fetching products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  // Filter products by category (client-side fallback if backend doesn't support it)
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((p: any) => p.category === selectedCategory)
  }, [products, selectedCategory])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <section className="grid gap-8">
        <motion.header
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="grid gap-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-balance bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-lg text-foreground/70">Loading products…</p>
        </motion.header>
      </section>
    )
  }

  return (
    <section className="grid gap-8">
      {/* Carousel */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Carousel items={carouselItems} />
      </motion.div>

      {/* Header */}
      <motion.header
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="grid gap-3"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          Our Products
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Browse our curated selection of premium automotive electrical products, 
          designed for reliability and performance.
        </p>
      </motion.header>

      {/* Filter and Products Layout */}
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Filter Sidebar */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </motion.div>

        {/* Products Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <CardContent>
                <p className="text-muted-foreground">
                  {selectedCategory 
                    ? `No products found in category "${selectedCategory}".` 
                    : "No products available at this time."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {currentProducts.map((p, index) => (
                  <motion.div
                    key={p._id}
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <ProductCard
                      product={{
                        _id: p._id,
                        name: p.name,
                        description: p.description,
                        price: p.price || 0,
                        inStock: p.inStock || 0,
                        image: p.image || "",
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-2 mt-8"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
