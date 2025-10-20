import Link from "next/link";
import type { Product } from "../lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <img
        src={
          product.image ||
          `/placeholder.svg?height=180&width=320&query=${encodeURIComponent(product.name)}`
        }
        alt={`Image of ${product.name}`}
        className="w-full h-44 object-cover"
      />

      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground text-balance">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-medium text-foreground">
          ₹{product.price ? product.price.toFixed(2) : "N/A"}
          </span>
          <Link
            href={`/products/${product._id}`}
            className="text-sm text-primary hover:underline"
            aria-label={`View details of ${product.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
