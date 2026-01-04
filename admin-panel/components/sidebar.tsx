"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const LINKS = [
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/analysis", label: "Analysis" },
  { href: "/dashboard/users", label: "Users" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.replace("/login")
  }

  return (
    <aside className="bg-white border-r">
      <div className="h-14 border-b px-4 flex items-center">
        <span className="font-semibold">Admin</span>
      </div>
      <nav className="p-2 grid gap-1">
        {LINKS.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-md text-sm ${active ? "bg-background font-medium" : "hover:bg-background"}`}
            >
              {l.label}
            </Link>
          )
        })}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 text-left"
          >
            Logout
          </button>
        )}
      </nav>
    </aside>
  )
}
