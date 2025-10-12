"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/select", label: "Select" },
  { href: "/billing", label: "Billing" },
  { href: "/debit", label: "Debit" },
  { href: "/history", label: "History" },
]

export default function Navbar() {
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          {LINKS.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm ${active ? "text-primary font-medium" : "text-foreground"}`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="text-sm text-primary hover:underline"
          >
            Logout
          </button>
        ) : (
          <Link href="/login" className="text-sm text-primary hover:underline">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
