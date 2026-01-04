"use client"

import Link from "next/link"
import Image from "next/image"
import type { Product } from "../lib/products"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        <Image
          src={
            product.image ||
            `/placeholder.svg?height=180&width=320&query=${encodeURIComponent(product.name)}`
          }
          alt={`Image of ${product.name}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <CardContent className="p-5 flex-1 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground text-balance line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xl font-bold text-primary">
            ₹{product.price ? product.price.toFixed(2) : "N/A"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          asChild
          variant="outline"
          className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Link
            href={`/products/${product._id}`}
            aria-label={`View details of ${product.name}`}
          >
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
