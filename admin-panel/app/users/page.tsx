"use client"

import { useEffect, useState } from "react"
import AuthGuard from "../../components/auth-guard"

type Contact = { name: string; email: string; message: string; createdAt: string }

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersInner />
    </AuthGuard>
  )
}

function UsersInner() {
  const [items, setItems] = useState<Contact[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("contact_submissions")
      const data = JSON.parse(raw || "[]")
      setItems(data)
    } catch {
      setItems([])
    }
  }, [])

  function loadDemo() {
    setItems([
      { name: "Jane Doe", email: "jane@example.com", message: "Loved the desk!", createdAt: new Date().toISOString() },
      {
        name: "John Smith",
        email: "john@example.com",
        message: "What is the shipping time?",
        createdAt: new Date().toISOString(),
      },
    ])
  }

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users (Contact Submissions)</h1>
        {items.length === 0 && (
          <button className="h-9 px-3 rounded-md border" onClick={loadDemo}>
            Load demo data
          </button>
        )}
      </div>
      <div className="bg-white border rounded-lg divide-y">
        {items.length === 0 && (
          <p className="p-4 text-sm text-muted">No submissions found. Connect backend or load demo.</p>
        )}
        {items.map((u, idx) => (
          <div key={idx} className="p-4 grid gap-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{u.name}</p>
              <span className="text-xs text-muted">{new Date(u.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm">{u.email}</p>
            <p className="text-sm text-muted">{u.message}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
