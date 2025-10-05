export type Product = {
  id: string
  name: string
  description: string
  price: number
  inStock: number
}

export const products: Product[] = [
  {
    id: "p-001",
    name: "Comfort Chair",
    description: "Ergonomic office chair with lumbar support.",
    price: 129.99,
    inStock: 34,
  },
  {
    id: "p-002",
    name: "Wooden Desk",
    description: "Minimalist solid-wood desk with cable management.",
    price: 299.0,
    inStock: 12,
  },
  {
    id: "p-003",
    name: "LED Desk Lamp",
    description: "Adjustable brightness and color temperature.",
    price: 39.95,
    inStock: 88,
  },
]

// Placeholder for real API integration (MongoDB) later.
export async function getProducts(): Promise<Product[]> {
  return products
}
export async function getProductById(id: string): Promise<Product | undefined> {
  return products.find((p) => p.id === id)
}
