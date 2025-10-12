"use client"

import type React from "react"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import Navbar from "../components/navbar"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const geistSans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" })

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoginPage, setIsLoginPage] = useState(false)

  useEffect(() => {
    setIsLoginPage(pathname === "/login")
  }, [pathname])

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        {!isLoginPage && <Navbar />}
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
