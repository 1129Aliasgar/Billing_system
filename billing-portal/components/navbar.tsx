"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/select", label: "Select" },
  { href: "/billing", label: "Billing" },
  { href: "/debit", label: "Debit" },
  { href: "/history", label: "History" },
]

export default function Navbar() {
  const pathname = usePathname()
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
        <Link href="/login" className="text-sm text-primary hover:underline">
          Login
        </Link>
      </div>
    </header>
  )
}
