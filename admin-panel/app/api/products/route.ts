import { NextRequest, NextResponse } from "next/server"

// List products and Create product
export async function GET() {
  try {
    const backendBase = process.env.BACKEND_URL
    const res = await fetch(`${backendBase}/products/get-products`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return NextResponse.json({ message: "Failed to fetch products" }, { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
    const res = await fetch(`${backendBase}/products/create-products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data || { message: "Failed to create" }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}


