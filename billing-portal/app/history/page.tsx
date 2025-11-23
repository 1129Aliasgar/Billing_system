"use client"

import { useStore, bills as billsApi } from "../../lib/store"
import { useEffect, useState, useMemo } from "react"
import AuthGuard from "../../components/auth-guard"
import type { SavedBill } from "../../lib/types"
import { generateBillPDF } from "../../lib/pdf-generator"

type DateFilter = "all" | "1day" | "1week" | "1month" | "1year"

export default function BillHistoryPage() {
  const bills = useStore((s) => s.bills)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    billsApi.fetchBills()
  }, [])

  // Filter bills by date
  const filteredBills = useMemo(() => {
    if (dateFilter === "all") return bills

    const now = new Date()
    const filterDate = new Date()

    switch (dateFilter) {
      case "1day":
        filterDate.setDate(now.getDate() - 1)
        break
      case "1week":
        filterDate.setDate(now.getDate() - 7)
        break
      case "1month":
        filterDate.setMonth(now.getMonth() - 1)
        break
      case "1year":
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return bills.filter((bill: SavedBill) => {
      const billDate = new Date(bill.createdAt)
      return billDate >= filterDate
    })
  }, [bills, dateFilter])

  // Paginate filtered bills
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBills.slice(startIndex, endIndex)
  }, [filteredBills, currentPage])

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filter changes
  }, [dateFilter])

  const toggleExpand = (billId: string) => {
    setExpanded((prev) => ({ ...prev, [billId]: !prev[billId] }))
  }

  const handleEdit = (bill: SavedBill) => {
    setEditing(bill.id)
    setEditData({
      customerName: bill.name,
      items: bill.items,
    })
  }

  const handleDelete = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      return
    }
    await billsApi.deleteBill(billId)
  }

  const handleSaveEdit = async () => {
    if (!editing || !editData) return
    await billsApi.updateBill(editing, editData)
    setEditing(null)
    setEditData(null)
  }

  const handleCancelEdit = () => {
    setEditing(null)
    setEditData(null)
  }

  return (
    <AuthGuard>
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Bill History</h1>
          <div className="flex items-center gap-3">
            <label htmlFor="dateFilter" className="text-sm font-medium">
              Filter:
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Time</option>
              <option value="1day">Last 1 Day</option>
              <option value="1week">Last 1 Week</option>
              <option value="1month">Last 1 Month</option>
              <option value="1year">Last 1 Year</option>
            </select>
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="text-sm text-gray-500">No bills found for the selected filter.</div>
        ) : (
          <>
            <div className="text-sm text-gray-600">
              Showing {paginatedBills.length} of {filteredBills.length} bills
            </div>
            <div className="space-y-3">
              {paginatedBills.map((b: SavedBill) => (
                <div key={b.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleExpand(b.id)}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {expanded[b.id] ? "▼" : "▶"}
                        </button>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Name</div>
                            <div className="font-medium">{b.name}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Status</div>
                            <span
                              className={
                                b.status === "completed"
                                  ? "text-green-600 font-semibold"
                                  : b.status === "due"
                                    ? "text-yellow-600 font-semibold"
                                    : "text-gray-600"
                              }
                            >
                              {b.status === "completed" ? "✓ Paid" : b.status === "due" ? "⚠ Debit" : b.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-600">Total</div>
                            <div className="font-medium">₹{b.total.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-600">Due</div>
                            <div className="font-medium">₹{b.dueAmount.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Bill ID</div>
                            <div className="font-mono text-xs font-medium">{b.billId || b.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {editing !== b.id ? (
                          <>
                            <button
                              onClick={() => generateBillPDF(b)}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                              title="Download PDF"
                            >
                              Download PDF
                            </button>
                            <button
                              onClick={() => handleEdit(b)}
                              className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 ml-8">
                      Created: {new Date(b.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {expanded[b.id] && (
                    <div className="p-4 border-t bg-white">
                      {editing === b.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Customer Name</label>
                            <input
                              type="text"
                              value={editData.customerName}
                              onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
                              className="w-full px-3 py-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Items</label>
                            <div className="space-y-2">
                              {editData.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <span className="flex-1">{item.name}</span>
                                  <span className="text-sm">Qty: {item.qty}</span>
                                  <span className="text-sm">Price: ₹{item.price}</span>
                                  <span className="text-sm font-medium">Total: ₹{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Items ({b.items.length})</h3>
                            {b.vehicleNumber && (
                              <div className="text-sm text-gray-600 mb-2">
                                Vehicle Number: <span className="font-medium">{b.vehicleNumber}</span>
                              </div>
                            )}
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left px-2 py-1">Product</th>
                                    {b.items.some((i) => i.hsnCode) && (
                                      <th className="text-left px-2 py-1">HSN Code</th>
                                    )}
                                    <th className="text-right px-2 py-1">Price</th>
                                    <th className="text-right px-2 py-1">Qty</th>
                                    <th className="text-right px-2 py-1">GST %</th>
                                    <th className="text-right px-2 py-1">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {b.items.map((item, idx) => {
                                    const gstRate = item.gstRate || 0
                                    const lineTotal = item.price * item.qty
                                    const gstAmount = (gstRate / 100) * lineTotal
                                    const total = lineTotal + gstAmount
                                    return (
                                      <tr key={idx} className="border-t">
                                        <td className="px-2 py-1">{item.name}</td>
                                        {b.items.some((i) => i.hsnCode) && (
                                          <td className="px-2 py-1 text-sm text-gray-600">
                                            {item.hsnCode || "-"}
                                          </td>
                                        )}
                                        <td className="px-2 py-1 text-right">₹{item.price.toFixed(2)}</td>
                                        <td className="px-2 py-1 text-right">{item.qty}</td>
                                        <td className="px-2 py-1 text-right">{gstRate}%</td>
                                        <td className="px-2 py-1 text-right font-medium">₹{total.toFixed(2)}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div className="flex justify-end gap-4 pt-2 border-t">
                            <div className="text-sm">
                              <span className="text-gray-600">Subtotal: </span>
                              <span className="font-medium">₹{(b.total - (b.items.reduce((sum, i) => sum + ((i.gstRate || 0) / 100) * i.price * i.qty, 0))).toFixed(2)}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">GST: </span>
                              <span className="font-medium">₹{b.items.reduce((sum, i) => sum + ((i.gstRate || 0) / 100) * i.price * i.qty, 0).toFixed(2)}</span>
                            </div>
                            <div className="text-sm font-semibold">
                              <span className="text-gray-600">Total: </span>
                              <span>₹{b.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AuthGuard>
  )
}
