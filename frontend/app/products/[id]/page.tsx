"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, DollarSign, CheckCircle2 } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

export default function ProductDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) {
          setProduct(null)
          return
        }
        const data = await res.json()
        setProduct(data.product)
      } catch (error) {
        console.error("Error fetching product:", error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading product details...</p>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/products">Back to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid gap-8">
      {/* Back Button */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Button
          variant="outline"
          onClick={() => router.push("/products")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </motion.div>

      {/* Product Details Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="grid gap-8 md:grid-cols-2"
      >
        {/* Product Image */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
          <div className="relative w-full aspect-square bg-muted">
            <Image
              src={product.image || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`}
              alt={`Image of ${product.name}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Card>

        {/* Product Information */}
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-balance mb-3 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.discription || product.description || "No description available."}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-6 py-4 border-y">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{product.price?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {product.metadata && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {/* Colors */}
                {Array.isArray(product.metadata.colorvalues) && product.metadata.colorvalues.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.colorvalues.map((c: string, idx: number) => (
                        <div
                          key={`${c}-${idx}`}
                          className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {Array.isArray(product.metadata.sizevalues) && product.metadata.sizevalues.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.sizevalues.map((s: string, idx: number) => (
                        <span
                          key={`${s}-${idx}`}
                          className="px-3 py-1.5 rounded-md border bg-card text-sm font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {Array.isArray(product.metadata.brandvalues) && product.metadata.brandvalues.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.brandvalues.map((b: string, idx: number) => (
                        <span
                          key={`${b}-${idx}`}
                          className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </section>
  )
}
