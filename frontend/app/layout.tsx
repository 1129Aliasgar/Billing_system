import type React from "react"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import Navbar from "../components/navbar"
import Footer from "../components/footer"

const geistSans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" })

export const metadata = {
  title: "Frontend | E-Store",
  description: "Responsive storefront with About (home), Contact, Products, and Product Details",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <Navbar />
        <main className="min-h-dvh max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
