"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const authed = localStorage.getItem("admin_authed") === "1"
    if (authed) router.replace("/dashboard/products")
  }, [router])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") || "")
    const password = String(form.get("password") || "")
    if (email === "admin@demo.com" && password === "admin123") {
      localStorage.setItem("admin_authed", "1")
      router.replace("/dashboard/products")
    } else {
      alert("Invalid credentials. Use admin@demo.com / admin123")
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="bg-white border rounded-lg p-6 w-full max-w-sm grid gap-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input
          className="h-10 px-3 rounded-md border bg-background"
          required
          name="email"
          placeholder="Email"
          type="email"
        />
        <input
          className="h-10 px-3 rounded-md border bg-background"
          required
          name="password"
          placeholder="Password"
          type="password"
        />
        <button className="h-10 rounded-md bg-primary text-white">Sign In</button>
        <p className="text-xs text-muted">Demo: admin@demo.com / admin123</p>
      </form>
    </div>
  )
}
