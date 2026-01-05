"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return true
    
    const payload = JSON.parse(atob(parts[1]))
    const exp = payload.exp
    
    if (!exp) return true
    
    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= exp * 1000
  } catch (error) {
    return true
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
      return
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      localStorage.removeItem("token")
      setTokenExpired(true)
      return
    }
    
    setReady(true)
  }, [router])

  if (tokenExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
          <p className="text-muted-foreground mb-6">
            Your session has expired. Please log in again to continue.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("token")
              router.replace("/login")
            }}
            className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!ready) return null
  return <>{children}</>
}
