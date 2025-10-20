import { headers } from "next/headers"

import { useEffect } from "react"

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hdrs = await headers()
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3004"
  const proto = hdrs.get("x-forwarded-proto") || "http"
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/products/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) {
    return <div className="text-sm ">Product not found.</div>
  }

  const productData = await res.json()
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-lg border overflow-hidden">
        <img
          src={productData.product.image || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(productData.product.name)}`}
          alt={`Image of ${productData.product.name}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{productData.product.name}</h1>
        <p className="">{productData.product.discription || productData.product.description}</p>
        <p className="text-lg font-semibold">${productData.product.price.toFixed(2)}</p>
        <p className="text-sm">In stock: {productData.product.inStock}</p>
        {Array.isArray(productData.product.metadata?.colorvalues) && productData.product.metadata.colorvalues.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Colors:</span>
            <div className="flex gap-1.5">
              {productData.product.metadata.colorvalues.map((c: string, idx: number) => (
                <span key={`${c}-${idx}`} className="inline-block w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />
              ))}
            </div>
            {Array.isArray(productData.product.metadata?.sizevalues) && productData.product.metadata.sizevalues.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Sizes:</span>
                <div className="flex gap-1.5">
                  {productData.product.metadata.sizevalues.map((s: string, idx: number) => (
                    <span key={`${s}-${idx}`} className="inline-block w-4 h-4 rounded-full border" style={{ backgroundColor: s }} />
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(productData.product.metadata?.brandvalues) && productData.product.metadata.brandvalues.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Brands:</span>
                <div className="flex gap-1.5">
                  {productData.product.metadata.brandvalues.map((b: string, idx: number) => (
                    <span key={`${b}-${idx}`}>| {b} |</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </section>
  )
}
