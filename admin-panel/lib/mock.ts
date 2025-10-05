export type Product = { id: string; name: string; description: string; price: number; inStock: number }

export function loadProducts(): Product[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem("admin_products")
  if (raw) return JSON.parse(raw) as Product[]
  const seeded: Product[] = [
    { id: "p-100", name: "Comfort Headphones", description: "Lightweight over-ear", price: 79.99, inStock: 32 },
    { id: "p-101", name: "Wireless Mouse", description: "Ergonomic, silent", price: 29.99, inStock: 58 },
    { id: "p-102", name: "Mechanical Keyboard", description: "Tactile switches", price: 99.0, inStock: 12 },
  ]
  localStorage.setItem("admin_products", JSON.stringify(seeded))
  return seeded
}

export function saveProducts(list: Product[]) {
  localStorage.setItem("admin_products", JSON.stringify(list))
}

export type ContactUser = { name: string; email: string; message: string; createdAt?: string }
export function loadContactUsers(): ContactUser[] {
  const raw = localStorage.getItem("frontend_contacts")
  return raw ? (JSON.parse(raw) as ContactUser[]) : []
}
