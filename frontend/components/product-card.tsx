import Link from "next/link"
import type { Product } from "../lib/products"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden flex flex-col">
      <img
        src={`/placeholder.svg?height=180&width=320&query=product-image`}
        alt={`Image of ${product.name}`}
        className="w-full h-44 object-cover"
      />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground text-balance">{product.name}</h3>
        <p className="text-sm  line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-medium text-foreground">${product.price.toFixed(2)}</span>
          <Link
            href={`/products/${product.id}`}
            className="text-sm text-primary hover:underline"
            aria-label={`View details of ${product.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
