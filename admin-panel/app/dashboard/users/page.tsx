"use client"
import { useEffect, useState } from "react"

type UserForm = { id: string; name: string; email: string; message: string; createdAt: string }

export default function UsersPage() {
  const [rows, setRows] = useState<UserForm[]>([])
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
          {rows.map((u) => (
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
    </section>
  )
}
