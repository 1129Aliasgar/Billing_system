export type Product = {
  id: string
  name: string
  price: number
}

export type LineItem = {
  productId: string
  name: string
  price: number
  qty: number
}

export type Bill = {
  id: string
  name: string
  items: LineItem[]
  gst: boolean
}
