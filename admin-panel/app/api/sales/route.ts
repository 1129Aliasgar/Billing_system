import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""

    let backendUrl = `${backendBase}/sales/get-sales`
    const params = new URLSearchParams()
    if (productId) params.append("productId", productId)
    if (month) params.append("month", month)
    if (year) params.append("year", year)
    if (params.toString()) backendUrl += `?${params.toString()}`

    const res = await fetch(backendUrl, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ message: "Failed to fetch sales" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

