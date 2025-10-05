export type Item = { id: string; name: string; price: number }
export const items: Item[] = (() => {
  // Prefer admin products if present to reflect "user can see all products added from admin"
  const raw = typeof window !== "undefined" ? localStorage.getItem("admin_products") : null
  if (raw) {
    const list = JSON.parse(raw) as Array<{ id: string; name: string; price: number }>
    return list.map((x) => ({ id: x.id, name: x.name, price: Number(x.price || 0) }))
  }
  return [
    { id: "p-100", name: "Comfort Headphones", price: 79.99 },
    { id: "p-101", name: "Wireless Mouse", price: 29.99 },
    { id: "p-102", name: "Mechanical Keyboard", price: 99.0 },
  ]
})()

export type BillLine = { id: string; name: string; price: number; qty: number }
export type Bill = { name: string; gst: boolean; lines: BillLine[] }

export function loadBill(): Bill {
  if (typeof window === "undefined") return { name: "New Bill", gst: false, lines: [] }
  const raw = localStorage.getItem("billing_current")
  if (raw) return JSON.parse(raw) as Bill
  const seed: Bill = { name: "New Bill", gst: false, lines: [] }
  localStorage.setItem("billing_current", JSON.stringify(seed))
  return seed
}
export function saveBill(b: Bill) {
  localStorage.setItem("billing_current", JSON.stringify(b))
}
