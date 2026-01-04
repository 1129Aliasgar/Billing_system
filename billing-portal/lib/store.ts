"use client"

import { useSyncExternalStore } from "react"
import type { Product, Bill, LineItem, SavedBillStatus, SavedBill } from "./types"

// Keys for localStorage
const K_PRODUCTS = "billing_products"
const K_BILL = "billing_current_bill"
const K_AUTH = "billing_logged_in"
const K_BILLS = "billing_bills" // new: persisted bills list

export type Store = {
  products: Product[]
  bill: Bill
  loggedIn: boolean
  bills: SavedBill[] // new field: saved bills
}

function defaultProducts(): Product[] {
  return []
}

function defaultBill(): Bill {
  return { 
    id: "bill-1", 
    name: "", // Buyer name
    vehicleNumber: "",
    delivery: "",
    buyerInfo: undefined,
    items: [], 
    gst: false, 
    cgstSgst: false,
    isDebit: false, 
    debitAmount: null 
  }
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
    ? { products: [], bill: defaultBill(), loggedIn: false, bills: [] }
    : {
        products: lsGet<Product[]>(K_PRODUCTS, []),
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

// Helper to transform backend bill to SavedBill format
function transformBackendBill(backendBill: any): SavedBill {
  return {
    id: backendBill._id || backendBill.billId, // Keep MongoDB _id for API calls
    billId: backendBill.billId || backendBill._id, // Custom billId for display
    name: backendBill.buyerName || backendBill.customerName || "Customer",
    vehicleNumber: backendBill.vehicleNumber,
    delivery: backendBill.delivery,
    buyerInfo: backendBill.buyerName || backendBill.buyerAddress || backendBill.buyerPhone || backendBill.buyerGstNumber ? {
      name: backendBill.buyerName || backendBill.customerName || "",
      address: backendBill.buyerAddress || "",
      phone: backendBill.buyerPhone || "",
      gstNumber: backendBill.buyerGstNumber || undefined,
    } : undefined,
    items: backendBill.items.map((item: any) => ({
      productId: typeof item.productId === "object" ? item.productId._id : item.productId,
      name: typeof item.productId === "object" ? item.productId.name : item.name,
      price: item.price,
      qty: item.quantity,
      gstRate: item.gstRate || 0,
      hsnCode: item.hsnCode,
    })),
    total: backendBill.totalAmount,
    dueAmount: backendBill.userDue,
    status: backendBill.status as SavedBillStatus,
    createdAt: backendBill.createdAt || new Date().toISOString(),
  }
}

// Fetch bills from backend
async function fetchBills() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return

    const res = await fetch("/api/billing", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      const data = await res.json()
      const backendBills = data.bills || []
      const transformedBills = backendBills.map(transformBackendBill)
      const s = getSnapshot()
      setState({ ...s, bills: transformedBills })
    }
  } catch (err) {
    console.error("Error fetching bills:", err)
  }
}

// finalize current bill as completed/due or save draft
async function finalize(status: Exclude<SavedBillStatus, "draft">) {
  const s = getSnapshot()
  const items = (s.bill.items as (LineItem & { gstRate?: number })[]) || []
  
  if (items.length === 0) {
    alert("Please add items to the bill")
    return
  }

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      alert("Please login to create bills")
      return
    }

    // Calculate GST
    const hasGst = s.bill.gst
    const gstPercent = hasGst ? 18 : 0
    const { total } = computeTotals(items)
    
    // Determine if this is a debit bill based on status or bill.isDebit
    const isDebit = status === "due" || s.bill.isDebit

    // Prepare items for backend
    const backendItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      gstRate: item.gstRate || (hasGst ? gstPercent : 0),
    }))

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerName: s.bill.name || "Customer",
        items: backendItems,
        gst: hasGst,
        gstPercent,
        isDebit,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      // Clear current bill and refresh bills list
      setState({ ...s, bill: defaultBill() })
      await fetchBills()
      alert("Bill created successfully!")
    } else {
      const error = await res.json()
      alert(error.message || "Failed to create bill")
    }
  } catch (err) {
    console.error("Error creating bill:", err)
    alert("Failed to create bill. Please try again.")
  }
}

async function saveBill() {
  // Save bill - if debit is checked, create as debit bill
  const s = getSnapshot()
  const items = (s.bill.items as (LineItem & { gstRate?: number })[]) || []
  
  if (items.length === 0) {
    alert("Please add items to the bill")
    return
  }

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      alert("Please login to create bills")
      return
    }

    // Calculate GST
    const hasGst = s.bill.gst
    const gstPercent = hasGst ? 18 : 0
    const { total } = computeTotals(items)
    
    // Determine debit status and amount
    const isDebit = s.bill.isDebit
    let userPaid = total
    let userDue = 0
    
    if (isDebit) {
      // If debitAmount is null, it means full debit
      // If debitAmount is a number, it means partial payment was made
      if (s.bill.debitAmount === null) {
        // Full debit
        userPaid = 0
        userDue = total
      } else {
        // Partial payment
        userPaid = s.bill.debitAmount
        userDue = total - s.bill.debitAmount
      }
    }

    // Prepare items for backend
    const backendItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      gstRate: item.gstRate || (hasGst ? gstPercent : 0),
      hsnCode: item.hsnCode,
    }))

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerName: s.bill.buyerInfo?.name || s.bill.name || "Customer",
        buyerName: s.bill.buyerInfo?.name || s.bill.name || undefined,
        buyerAddress: s.bill.buyerInfo?.address || undefined,
        buyerPhone: s.bill.buyerInfo?.phone || undefined,
        buyerGstNumber: s.bill.buyerInfo?.gstNumber || undefined,
        vehicleNumber: s.bill.vehicleNumber || undefined,
        delivery: s.bill.delivery || undefined,
        items: backendItems,
        gst: hasGst,
        gstPercent,
        cgstSgst: s.bill.cgstSgst || false,
        isDebit,
        userPaid, // Send the paid amount
        userDue,  // Send the due amount
      }),
    })

    if (res.ok) {
      const data = await res.json()
      // Clear current bill and refresh bills list
      setState({ ...s, bill: defaultBill() })
      await fetchBills()
      alert("Bill saved successfully!")
    } else {
      const error = await res.json()
      alert(error.message || "Failed to save bill")
    }
  } catch (err) {
    console.error("Error saving bill:", err)
    alert("Failed to save bill. Please try again.")
  }
}

// pay partial due amount and update status
async function payDue(billId: string, amount: number) {
  if (!amount || amount <= 0) {
    alert("Please enter a valid payment amount")
    return
  }

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      alert("Please login")
      return
    }

    const res = await fetch(`/api/billing/${billId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    })

    if (res.ok) {
      await fetchBills()
      alert("Payment updated successfully!")
    } else {
      const error = await res.json()
      alert(error.message || "Failed to update payment")
    }
  } catch (err) {
    console.error("Error updating payment:", err)
    alert("Failed to update payment. Please try again.")
  }
}

// Update bill
async function updateBill(billId: string, data: { customerName?: string }) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      alert("Please login")
      return
    }

    const res = await fetch(`/api/billing/${billId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      await fetchBills()
      alert("Bill updated successfully!")
    } else {
      const error = await res.json()
      alert(error.message || "Failed to update bill")
    }
  } catch (err) {
    console.error("Error updating bill:", err)
    alert("Failed to update bill. Please try again.")
  }
}

// Delete bill
async function deleteBill(billId: string) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      alert("Please login")
      return
    }

    const res = await fetch(`/api/billing/${billId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.ok) {
      await fetchBills()
      alert("Bill deleted successfully!")
    } else {
      const error = await res.json()
      alert(error.message || "Failed to delete bill")
    }
  } catch (err) {
    console.error("Error deleting bill:", err)
    alert("Failed to delete bill. Please try again.")
  }
}

// export a bills API object as named export used by pages
export const bills = {
  finalizeCompleted: () => finalize("completed"),
  finalizeDebit: () => finalize("due"),
  saveBill,
  payDue,
  fetchBills,
  updateBill,
  deleteBill,
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
      // Use _id from backend product
      const productId = p._id
      const existing = s.bill.items.find((i) => i.productId === productId)
      // Format product name with brand if available
      const brandName = p.metadata?.brand?.[0] || p.metadata?.brandvalues?.[0]
      const displayName = brandName ? `${p.name} (${brandName})` : p.name
      const items: LineItem[] = existing
        ? s.bill.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
        : [...s.bill.items, { 
            productId, 
            name: displayName, 
            price: p.price, 
            qty,
            hsnCode: (p as any).HSNC_code || undefined
          }]
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
  function toggleDebit(v: boolean) {
    withS((s) => setState({ 
      ...s, 
      bill: { 
        ...s.bill, 
        isDebit: v,
        debitAmount: v ? null : null // Reset to null when toggling
      } 
    }))
  }
  function setDebitAmount(amount: number | null) {
    withS((s) => setState({ 
      ...s, 
      bill: { 
        ...s.bill, 
        debitAmount: amount 
      } 
    }))
  }
  function setVehicleNumber(vehicleNumber: string) {
    withS((s) => setState({ 
      ...s, 
      bill: { 
        ...s.bill, 
        vehicleNumber: vehicleNumber || undefined
      } 
    }))
  }
  function setDelivery(delivery: string) {
    withS((s) => setState({ 
      ...s, 
      bill: { 
        ...s.bill, 
        delivery: delivery || undefined
      } 
    }))
  }
  function toggleCgstSgst(v: boolean) {
    withS((s) => setState({ 
      ...s, 
      bill: { 
        ...s.bill, 
        cgstSgst: v 
      } 
    }))
  }
  function setBuyerInfo(buyerInfo: { name: string; address: string; phone: string; gstNumber?: string }) {
    withS((s) => setState({ 
      ...s, 
      bill: { 
        ...s.bill, 
        name: buyerInfo.name,
        buyerInfo 
      } 
    }))
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
    toggleDebit,
    setBuyerInfo,
    setDebitAmount,
    setVehicleNumber,
    setDelivery,
    toggleCgstSgst,
  }
}
