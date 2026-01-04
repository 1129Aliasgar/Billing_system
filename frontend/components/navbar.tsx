"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact Us" },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-2 h-16 flex items-center justify-between">
        <nav className="flex items-center gap-8">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                className={`text-sm font-medium transition-colors ${
                  active 
                    ? "text-primary" 
                    : "text-foreground/70 hover:text-primary"
                } link-underline`}
                href={item.href}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link 
          href="/" 
          className="flex items-center justify-center h-12 w-12 rounded-full overflow-hidden hover:bg-accent transition-colors"
          aria-label="Home"
        >
          <Image
            src="/icon.jpg"
            alt="Company Logo"
            width={56}
            height={56}
            className="rounded-full object-contain"
            priority
          />
        </Link>
      </div>
    </header>
  )
}
