import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""

    const res = await fetch(`${backendBase}/billing/get-debit-bills`, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ message: "Failed to fetch debit bills" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

