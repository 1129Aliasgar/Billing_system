import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const billingOnly = url.searchParams.get('billing') === 'true'
    const backendBase = process.env.BACKEND_URL 
    
    let backendUrl = `${backendBase}/products/get-products`
    if (billingOnly) {
      backendUrl += '?billing=true'
    }
    
    const res = await fetch(backendUrl, {
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
    
    const res = await fetch(`${backendBase}/products/update-product/${body.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body.data),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
