"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true"
    if (!isLoggedIn) router.replace("/login")
    else setReady(true)
  }, [router])

  if (!ready) return null
  return <>{children}</>
}
