"use client"

import BillSummary from "../../components/bill-summary"
import { bills as billsApi, useActions } from "../../lib/store"

export default function BillingPage() {
  const { clearBill } = useActions()

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-semibold">Billing</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => billsApi.saveDraft()}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Save
        </button>
        <button
          onClick={() => billsApi.finalizeCompleted()}
          className="px-3 py-2 rounded bg-brand text-white hover:opacity-90 text-sm"
        >
          Complete
        </button>
        <button
          onClick={() => billsApi.finalizeDebit()}
          className="px-3 py-2 rounded bg-amber-500 text-white hover:opacity-90 text-sm"
        >
          Debit
        </button>
        <button onClick={() => clearBill()} className="px-3 py-2 rounded bg-danger text-white hover:opacity-90 text-sm">
          Cancel
        </button>
      </div>

      <BillSummary />
      <p className="text-sm text-muted">
        Bills can be edited or cleared. Connect to your database to persist bills and add invoice export later.
      </p>
    </section>
  )
}
