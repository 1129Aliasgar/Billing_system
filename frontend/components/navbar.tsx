"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                className={`text-sm ${active ? "text-primary font-medium" : "text-foreground"} link-underline`}
                href={item.href}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link href="/" className="text-lg font-semibold text-foreground" aria-label="E-Store home">
          E-Store
        </Link>
      </div>
    </header>
  )
}
