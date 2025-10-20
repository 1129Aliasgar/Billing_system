"use client"
import { useEffect, useState } from "react"

type UserForm = { id: string; name: string; email: string; message: string; createdAt: string }

export default function UsersPage() {
  const [rows, setRows] = useState<UserForm[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchContactForms = async () => {
    const Response = await fetch("/api/contact")
    if (!Response.ok) {
      setRows([])
    }
    const data = await Response.json()
    setRows(data)
  }
  
  useEffect(() => {
    // In separate apps, this won't share storage. Replace with MongoDB later.
    fetchContactForms()
  }, [])

  const totalPages = Math.ceil(rows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRows = rows.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Users (Contact Submissions)</h1>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 bg-[var(--color-muted)] text-sm font-medium p-2">
          <div>Name</div>
          <div>Email</div>
          <div>Message</div>
          {/* <div>Date</div> */}
        </div>
        <ul className="divide-y">
          {currentRows.map((u) => (
            <li key={u.id} className="grid grid-cols-3 gap-2 p-2 text-sm">
              <div>{u.name}</div>
              <div className="truncate">{u.email}</div>
              <div className="truncate">{u.message}</div>
              {/* <div>{new Date(u.createdAt).toLocaleDateString()}</div> */}
            </li>
          ))}
          {rows.length === 0 && <li className="p-3 text-sm text-gray-600">No data yet.</li>}
        </ul>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-2 rounded-md ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "border hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
