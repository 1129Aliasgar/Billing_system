"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()
      localStorage.setItem("token", data.token)
      router.replace("/dashboard/products")

    } catch (error: any) {
      setError(error instanceof Error ? error.message : "An error occurred")
    }
  }

  useEffect(() => {
    const authed = localStorage.getItem("token") !== null
    if (authed) router.replace("/dashboard/products")
  }, [router])

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 w-full max-w-sm grid gap-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input
          className="h-10 px-3 rounded-md border bg-background"
          required
          name="email"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="h-10 px-3 rounded-md border bg-background"
          required
          name="password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="h-10 rounded-md bg-primary text-white" type="submit">Sign In</button>
        <p className="text-xs text-red-500 text-center">{error}</p>
      </form>
    </div>
  )
}
