import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""

    const res = await fetch(`${backendBase}/billing/create-bill`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const isDebit = url.searchParams.get("isDebit")
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""

    let backendUrl = `${backendBase}/billing/get-bills`
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    if (isDebit) params.append("isDebit", isDebit)
    if (params.toString()) backendUrl += `?${params.toString()}`

    const res = await fetch(backendUrl, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ message: "Failed to fetch bills" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

