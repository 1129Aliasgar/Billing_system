"use client"
import { useEffect, useState } from "react"

type UserForm = { id: string; name: string; email: string; message: string; createdAt: string }

export default function UsersPage() {
  const [rows, setRows] = useState<UserForm[]>([])
  useEffect(() => {
    // In separate apps, this won't share storage. Replace with MongoDB later.
    const list: UserForm[] = JSON.parse(localStorage.getItem("contact_submissions") || "[]")
    setRows(list)
  }, [])
  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Users (Contact Submissions)</h1>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-[var(--color-muted)] text-sm font-medium p-2">
          <div>Name</div>
          <div>Email</div>
          <div>Message</div>
          <div>Date</div>
        </div>
        <ul className="divide-y">
          {rows.map((u) => (
            <li key={u.id} className="grid grid-cols-4 gap-2 p-2 text-sm">
              <div>{u.name}</div>
              <div className="truncate">{u.email}</div>
              <div className="truncate">{u.message}</div>
              <div>{new Date(u.createdAt).toLocaleDateString()}</div>
            </li>
          ))}
          {rows.length === 0 && <li className="p-3 text-sm text-gray-600">No data yet.</li>}
        </ul>
      </div>
    </section>
  )
}
