"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useActions, useStore } from "../../lib/store"
import { useEffect } from "react"

export default function BillingLogin() {
  const router = useRouter()
  const loggedIn = useStore((s: any) => s.loggedIn)
  const { login } = useActions()

  useEffect(() => {
    if (loggedIn) router.replace("/products")
  }, [loggedIn, router])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") || "")
    const password = String(fd.get("password") || "")
    if (email === "billing@demo.com" && password === "billing123") {
      login()
      router.replace("/products")
    } else {
      alert("Use billing@demo.com / billing123")
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="bg-white border rounded-lg p-6 w-full max-w-sm grid gap-4">
        <h1 className="text-xl font-semibold">Billing Login</h1>
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
        <p className="text-xs text-muted">Demo: billing@demo.com / billing123</p>
      </form>
    </div>
  )
}
