export type Product = {
  id: string
  name: string
  short: string
  description: string
  price: number
  image: string
  inStock: number
}

export const products: Product[] = [
  {
    id: "p-100",
    name: "Comfort Headphones",
    short: "Lightweight over-ear",
    description: "Comfortable, lightweight headphones with balanced sound and foldable design.",
    price: 79.99,
    image: "/premium-headphones.png",
    inStock: 32,
  },
  {
    id: "p-101",
    name: "Wireless Mouse",
    short: "Ergonomic, silent",
    description: "Ergonomic wireless mouse with silent clicks and adjustable DPI.",
    price: 29.99,
    image: "/wireless-mouse-product.png",
    inStock: 58,
  },
  {
    id: "p-102",
    name: "Mechanical Keyboard",
    short: "Tactile switches",
    description: "Compact mechanical keyboard with tactile switches and white backlight.",
    price: 99.0,
    image: "/mechanical-keyboard-product.png",
    inStock: 12,
  },
]
