import type React from "react"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import Navbar from "../components/navbar"

const geistSans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" })

export const metadata = {
  title: "Billing Portal | E-Store",
  description: "Create and manage bills with GST or non-GST",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
