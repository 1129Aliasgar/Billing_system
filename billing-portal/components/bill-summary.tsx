"use client"

import { useMemo, useState } from "react"
import { useActions, useStore } from "../lib/store"
import { bills as billsApi } from "../lib/store"
import type { LineItem } from "../lib/types"

export default function BillSummary() {
  const bill = useStore((s: any) => s.bill)
  const { updateQty, removeItem, toggleGST, setBillName, clearBill, setItemPrice, setItemGst, toggleDebit, setDebitAmount } = useActions()
  const [debitMode, setDebitMode] = useState<"full" | "partial">("full")
  const [partialAmount, setPartialAmount] = useState<string>("")

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

  const handleDebitToggle = (checked: boolean) => {
    toggleDebit(checked)
    if (!checked) {
      setDebitAmount(null)
      setDebitMode("full")
      setPartialAmount("")
    }
  }

  const handleDebitModeChange = (mode: "full" | "partial") => {
    setDebitMode(mode)
    if (mode === "full") {
      setDebitAmount(null)
      setPartialAmount("")
    } else {
      setPartialAmount("")
    }
  }

  const handlePartialAmountChange = (value: string) => {
    setPartialAmount(value)
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= grandTotal) {
      setDebitAmount(numValue)
    } else if (value === "") {
      setDebitAmount(null)
    }
  }

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
                  No items yet. Add products from above.
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
                  <button className="h-8 px-3 rounded-md border hover:bg-gray-50" onClick={() => removeItem(i.productId)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Totals Section */}
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
        </div>

        {/* Debit Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <label className="flex items-center gap-2 text-sm font-medium mb-3">
            <input 
              type="checkbox" 
              checked={bill.isDebit} 
              onChange={(e) => handleDebitToggle(e.target.checked)}
            />
            <span>Mark as Debit</span>
          </label>

          {bill.isDebit && (
            <div className="grid gap-3 mt-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="debitMode"
                    checked={debitMode === "full"}
                    onChange={() => handleDebitModeChange("full")}
                  />
                  <span>Full Debit (₹{grandTotal.toFixed(2)})</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="debitMode"
                    checked={debitMode === "partial"}
                    onChange={() => handleDebitModeChange("partial")}
                  />
                  <span>Partial Payment</span>
                </label>
              </div>

              {debitMode === "partial" && (
                <div className="grid gap-2">
                  <label className="text-sm">
                    Amount Paid:
                    <input
                      type="number"
                      min={0}
                      max={grandTotal}
                      step="0.01"
                      value={partialAmount}
                      onChange={(e) => handlePartialAmountChange(e.target.value)}
                      className="h-9 px-3 rounded-md border bg-white w-full mt-1"
                      placeholder="Enter paid amount"
                    />
                  </label>
                  {partialAmount && !isNaN(Number(partialAmount)) && Number(partialAmount) > 0 && (
                    <div className="text-xs text-gray-600">
                      Remaining: ₹{(grandTotal - Number(partialAmount)).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {bill.isDebit && (
                <div className="text-xs text-gray-600 mt-2 p-2 bg-yellow-50 rounded">
                  {debitMode === "full" 
                    ? `Full amount (₹${grandTotal.toFixed(2)}) will be marked as debit.`
                    : partialAmount && !isNaN(Number(partialAmount))
                      ? `Paid: ₹${Number(partialAmount).toFixed(2)}, Debit: ₹${(grandTotal - Number(partialAmount)).toFixed(2)}`
                      : "Enter the amount customer paid."
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
