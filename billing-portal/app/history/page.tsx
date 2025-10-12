"use client"

import { useStore } from "../../lib/store"
import AuthGuard from "../../components/auth-guard"

export default function BillHistoryPage() {
  const bills = useStore((s) => s.bills)

  return (
    <AuthGuard>
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Bill History</h1>
        {bills.length === 0 ? (
          <div className="text-sm text-gray-500">No bills yet.</div>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-right px-3 py-2">Due</th>
                  <th className="text-left px-3 py-2">Created</th>
                  <th className="text-left px-3 py-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2">{b.name}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          b.status === "completed"
                            ? "text-green-600"
                            : b.status === "due"
                              ? "text-danger"
                              : "text-gray-600"
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">₹{b.total.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">₹{b.dueAmount.toFixed(2)}</td>
                    <td className="px-3 py-2">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{b.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AuthGuard>
  )
}
