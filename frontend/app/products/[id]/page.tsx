import { getProductById } from "../../../lib/products"

export default async function ProductDetails({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  if (!product) {
    return <div className="text-sm ">Product not found.</div>
  }
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-lg border overflow-hidden">
        <img
          src={`/placeholder.svg?height=400&width=600&query=product-detail`}
          alt={`Image of ${product.name}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
        <p className="">{product.description}</p>
        <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
        <p className="text-sm">In stock: {product.inStock}</p>
        <div className="flex gap-3">
          <button className="h-10 px-4 rounded-md bg-primary text-white">Add to Cart</button>
          <button className="h-10 px-4 rounded-md border">Wishlist</button>
        </div>
      </div>
    </section>
  )
}
