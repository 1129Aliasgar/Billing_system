import type React from "react"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" })

export const metadata = {
  title: "Admin Panel | E-Store",
  description: "Manage products, users, and analysis",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  )
}
