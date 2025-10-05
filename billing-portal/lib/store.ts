"use client"

import { useSyncExternalStore } from "react"
import type { Product, Bill, LineItem, SavedBillStatus } from "./types"

// Keys for localStorage
const K_PRODUCTS = "billing_products"
const K_BILL = "billing_current_bill"
const K_AUTH = "billing_logged_in"
const K_BILLS = "billing_bills" // new: persisted bills list

export type SavedBill = {
  id: string
  name: string
  items: (LineItem & { gstRate?: number })[]
  total: number
  dueAmount: number
  status: SavedBillStatus
  createdAt: string
}

export type Store = {
  products: Product[]
  bill: Bill
  loggedIn: boolean
  bills: SavedBill[] // new field: saved bills
}

function defaultProducts(): Product[] {
  return [
    { id: "b-1", name: "Comfort Chair", price: 129.99 },
    { id: "b-2", name: "Wooden Desk", price: 299.0 },
    { id: "b-3", name: "LED Desk Lamp", price: 39.95 },
  ]
}

function defaultBill(): Bill {
  return { id: "bill-1", name: "Untitled Bill", items: [], gst: false }
}

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// In-memory state + listeners
let state: Store =
  typeof window === "undefined"
    ? { products: defaultProducts(), bill: defaultBill(), loggedIn: false, bills: [] }
    : {
        products: lsGet<Product[]>(K_PRODUCTS, defaultProducts()),
        bill: lsGet<Bill>(K_BILL, defaultBill()),
        loggedIn: window.localStorage.getItem(K_AUTH) === "true",
        bills: lsGet<SavedBill[]>(K_BILLS, []), // new
      }

const listeners = new Set<() => void>()
const serverSnapshot: Store = state // stable reference

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function read(): Store {
  return state
}

function getSnapshot(): Store {
  return state
}

function getServerSnapshot(): Store {
  // Stable value to satisfy React useSyncExternalStore on server
  return serverSnapshot
}

function setState(next: Store) {
  state = next
  // persist to localStorage
  lsSet(K_PRODUCTS, state.products)
  lsSet(K_BILL, state.bill)
  lsSet(K_BILLS, state.bills) // new
  if (typeof window !== "undefined") {
    if (state.loggedIn) window.localStorage.setItem(K_AUTH, "true")
    else window.localStorage.removeItem(K_AUTH)
  }
  listeners.forEach((l) => l())
}

// helpers to compute totals with per-item GST and price editing
function computeTotals(items: (LineItem & { gstRate?: number })[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const gst = items.reduce((sum, i) => sum + ((i.gstRate ?? 0) / 100) * i.price * i.qty, 0)
  const total = Number((subtotal + gst).toFixed(2))
  return { subtotal: Number(subtotal.toFixed(2)), gst: Number(gst.toFixed(2)), total }
}

// actions specific to line items for price and GST
function setItemPrice(productId: string, price: number) {
  setState({
    ...getSnapshot(),
    bill: {
      ...getSnapshot().bill,
      items: getSnapshot().bill.items.map((i) => (i.productId === productId ? { ...i, price } : i)),
    },
  })
}

function setItemGst(productId: string, gstRate: number) {
  setState({
    ...getSnapshot(),
    bill: {
      ...getSnapshot().bill,
      items: getSnapshot().bill.items.map((i) => (i.productId === productId ? { ...i, gstRate } : i)) as any,
    },
  })
}

// finalize current bill as completed/due or save draft
function finalize(status: Exclude<SavedBillStatus, "draft">) {
  const s = getSnapshot()
  const id = `b-${Date.now()}`
  const items = (s.bill.items as (LineItem & { gstRate?: number })[]) || []
  const { total } = computeTotals(items)
  const dueAmount = status === "due" ? total : 0
  const rec: SavedBill = {
    id,
    name: s.bill.name || "Untitled Bill",
    items,
    total,
    dueAmount,
    status,
    createdAt: new Date().toISOString(),
  }
  setState({ ...s, bills: [...s.bills, rec], bill: defaultBill() })
}

function saveDraft() {
  const s = getSnapshot()
  const id = `d-${Date.now()}`
  const items = (s.bill.items as (LineItem & { gstRate?: number })[]) || []
  const { total } = computeTotals(items)
  const rec: SavedBill = {
    id,
    name: s.bill.name || "Draft Bill",
    items,
    total,
    dueAmount: total,
    status: "draft",
    createdAt: new Date().toISOString(),
  }
  setState({ ...s, bills: [...s.bills, rec] })
}

// pay partial due amount and update status
function payDue(billId: string, amount: number) {
  if (!amount || amount <= 0) return
  const s = getSnapshot()
  const bills = s.bills.map((b) => {
    if (b.id !== billId) return b
    const nextDue = Math.max(0, Number((b.dueAmount - amount).toFixed(2)))
    return { ...b, dueAmount: nextDue, status: nextDue === 0 ? "completed" : "due" }
  })
  setState({ ...s, bills })
}

// export a bills API object as named export used by pages
export const bills = {
  finalizeCompleted: () => finalize("completed"),
  finalizeDebit: () => finalize("due"),
  saveDraft,
  payDue,
}

export function useStore<T = Store>(selector?: (s: Store) => T) {
  const state = useSyncExternalStore(subscribe, read, () => serverSnapshot)
  return selector ? selector(state) : (state as any)
}

export function useActions() {
  function withS<R>(fn: (s: Store) => R): R {
    return fn(getSnapshot())
  }

  function setBillName(name: string) {
    withS((s) => setState({ ...s, bill: { ...s.bill, name } }))
  }
  function toggleGST(v: boolean) {
    withS((s) => setState({ ...s, bill: { ...s.bill, gst: v } }))
  }
  function addItem(p: Product, qty: number) {
    withS((s) => {
      const existing = s.bill.items.find((i) => i.productId === p.id)
      const items: LineItem[] = existing
        ? s.bill.items.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + qty } : i))
        : [...s.bill.items, { productId: p.id, name: p.name, price: p.price, qty }]
      setState({ ...s, bill: { ...s.bill, items } })
    })
  }
  function updateQty(productId: string, qty: number) {
    withS((s) => {
      const items = s.bill.items.map((i) => (i.productId === productId ? { ...i, qty } : i))
      setState({ ...s, bill: { ...s.bill, items } })
    })
  }
  function removeItem(productId: string) {
    withS((s) => setState({ ...s, bill: { ...s.bill, items: s.bill.items.filter((i) => i.productId !== productId) } }))
  }
  function clearBill() {
    withS((s) => setState({ ...s, bill: defaultBill() }))
  }
  function login() {
    withS((s) => setState({ ...s, loggedIn: true }))
  }
  function logout() {
    withS((s) => setState({ ...s, loggedIn: false }))
  }
  return {
    setBillName,
    toggleGST,
    addItem,
    updateQty,
    removeItem,
    clearBill,
    login,
    logout,
    setItemPrice,
    setItemGst,
  }
}
