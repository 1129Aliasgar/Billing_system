"use client"

import { useMemo } from "react"
import { useActions, useStore } from "../lib/store"
import { bills as billsApi } from "../lib/store" // use bills API for Save
import type { LineItem } from "../lib/types"

export default function BillSummary() {
  const bill = useStore((s: any) => s.bill)
  const { updateQty, removeItem, toggleGST, setBillName, clearBill, setItemPrice, setItemGst } = useActions()

  const { subTotal, gstAmount, grandTotal } = useMemo(() => {
    let sub = 0
    let gst = 0
    for (const i of bill.items as (LineItem & { gstRate?: number })[]) {
      const line = i.price * i.qty
      sub += line
      const rate = typeof i.gstRate === "number" ? i.gstRate : bill.gst ? 18 : 0
      gst += (rate / 100) * line
    }
    const total = sub + gst
    return { subTotal: sub, gstAmount: gst, grandTotal: total }
  }, [bill])

  return (
    <div className="bg-white border rounded-lg p-4 grid gap-4">
      <div className="flex items-center gap-3">
        <label htmlFor="billName" className="text-sm font-medium">
          Bill Name
        </label>
        <input
          id="billName"
          className="h-9 px-3 rounded-md border bg-background w-64"
          value={bill.name}
          onChange={(e) => setBillName(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm ml-auto">
          <input type="checkbox" checked={bill.gst} onChange={(e) => toggleGST(e.target.checked)} />
          Global GST (18%)
        </label>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-2">Product</th>
              <th className="text-right p-2">Price</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">GST %</th>
              <th className="text-right p-2">Total</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {bill.items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-muted">
                  No items yet.
                </td>
              </tr>
            )}
            {bill.items.map((i: any) => (
              <tr key={i.productId} className="border-t">
                <td className="p-2">{i.name}</td>
                <td className="p-2 text-right">
                  <input
                    className="h-8 w-24 px-2 rounded-md border bg-background text-right"
                    type="number"
                    min={0}
                    step="0.01"
                    value={i.price}
                    onChange={(e) => setItemPrice(i.productId, Math.max(0, Number(e.target.value || 0)))}
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    className="h-8 w-20 px-2 rounded-md border bg-background text-right"
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => updateQty(i.productId, Math.max(1, Number(e.target.value || 1)))}
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    className="h-8 w-20 px-2 rounded-md border bg-background text-right"
                    type="number"
                    min={0}
                    step="0.1"
                    value={typeof i.gstRate === "number" ? i.gstRate : bill.gst ? 18 : 0}
                    onChange={(e) => setItemGst(i.productId, Math.max(0, Number(e.target.value || 0)))}
                  />
                </td>
                <td className="p-2 text-right">
                  {(() => {
                    const rate = typeof i.gstRate === "number" ? i.gstRate : bill.gst ? 18 : 0
                    const line = i.price * i.qty
                    const lineTotal = line + (rate / 100) * line
                    return `₹${lineTotal.toFixed(2)}`
                  })()}
                </td>
                <td className="p-2 text-right">
                  <button className="h-8 px-3 rounded-md border" onClick={() => removeItem(i.productId)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto grid gap-1 text-sm w-full max-w-xs">
        <div className="flex items-center justify-between">
          <span className="">Subtotal</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="">GST Total</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between font-semibold border-t pt-2 mt-2">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button className="h-9 px-3 rounded-md bg-primary text-white" onClick={() => billsApi.saveDraft()}>
            Save Bill
          </button>
          <button className="h-9 px-3 rounded-md border" onClick={clearBill}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
