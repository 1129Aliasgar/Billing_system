"use client"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Sidebar from "../../components/sidebar"

const nav = [
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/analysis", label: "Analysis" },
  { href: "/dashboard/users", label: "Users" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Only mark ready after we check the token to avoid flicker
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) return null

  return (
    <div className="min-h-dvh grid md:grid-cols-[220px_1fr]">
      <Sidebar />
      <main className="p-6">
        <div className="mb-4 flex gap-4">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={pathname === n.href ? "text-[var(--color-primary)] font-medium" : "text-foreground"}
            >
              {n.label}
            </Link>
          ))}
        </div>
        {children}
      </main>
    </div>
  )
}
