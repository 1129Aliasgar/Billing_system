"use client"

import { bills as billsApi, useStore } from "../../lib/store"
import { useMemo, useState, useEffect } from "react"
import AuthGuard from "../../components/auth-guard"

type Group = {
  name: string
  count: number
  totalDue: number
  bills: { id: string; billId?: string; dueAmount: number; createdAt: string; total: number }[]
}

export default function DebitBillsPage() {
  const allBills = useStore((s) => s.bills)
  const dueBills = allBills.filter((b:any) => b.status === "due" || b.dueAmount > 0)

  useEffect(() => {
    billsApi.fetchBills()
  }, [])

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>()
    for (const b of dueBills) {
      const g = map.get(b.name) ?? { 
        name: b.name, 
        count: 0, 
        totalDue: 0, 
        bills: [] as Group['bills'] 
      }
      g.count += 1
      g.totalDue = Number((g.totalDue + b.dueAmount).toFixed(2))
      g.bills.push({ 
        id: b.id, 
        billId: b.billId, 
        dueAmount: b.dueAmount, 
        createdAt: b.createdAt, 
        total: b.total 
      })
      map.set(b.name, g)
    }
    return Array.from(map.values())
  }, [dueBills])

  const [open, setOpen] = useState<Record<string, boolean>>({})

  const overall = groups.reduce((acc, g) => acc + g.totalDue, 0)

  return (
    <AuthGuard>
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Debit Bills</h1>
          <div className="text-sm">
            Overall Due: <span className="text-danger font-semibold">{overall.toFixed(2)}</span>
          </div>
        </header>

        {groups.length === 0 ? (
          <div className="text-sm text-gray-500">No due bills.</div>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => (
              <li key={g.name} className="border rounded">
                <button
                  onClick={() => setOpen((s) => ({ ...s, [g.name]: !s[g.name] }))}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{g.count}</span>
                  </div>
                  <div className="text-danger font-semibold">{g.totalDue.toFixed(2)}</div>
                </button>

                {open[g.name] && (
                  <div className="border-t p-4 space-y-3">
                    {g.bills.map((b: any) => (
                      <BillRow 
                        key={b.id} 
                        billId={b.id} 
                        dueAmount={b.dueAmount} 
                        createdAt={b.createdAt}
                        billCustomId={b.billId}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </AuthGuard>
  )
}

function BillRow({ billId, dueAmount, createdAt, billCustomId }: { billId: string; dueAmount: number; createdAt: string; billCustomId?: string }) {
  const [amount, setAmount] = useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePayment = async () => {
    if (amount <= 0) {
      alert("Please enter a valid payment amount")
      return
    }
    setIsUpdating(true)
    await billsApi.payDue(billId, amount)
    setAmount(0)
    setIsUpdating(false)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-gray-600">
        <div>Bill ID: {billCustomId || billId.slice(0, 8)}</div>
        <div>Created: {new Date(createdAt).toLocaleString()}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm">
          Due: <span className="text-danger font-semibold">₹{dueAmount.toFixed(2)}</span>
        </div>
        <input
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value || 0)))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handlePayment()
            }
          }}
          className="border rounded px-3 py-2 w-28 text-right"
          placeholder="Payment"
          disabled={isUpdating}
        />
        <button
          onClick={handlePayment}
          disabled={isUpdating || amount <= 0}
          className="px-3 py-2 bg-brand text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Updating..." : "Apply Payment"}
        </button>
        <button
          onClick={handlePayment}
          disabled={isUpdating || amount <= 0}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💾 Save
        </button>
      </div>
    </div>
  )
}
