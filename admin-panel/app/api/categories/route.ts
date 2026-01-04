import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const activeOnly = url.searchParams.get("activeOnly")
    
    let queryParams = []
    if (activeOnly === "true") queryParams.push("activeOnly=true")
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
    
    const res = await fetch(`${backendBase}/categories/get-categories${queryString}`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: auth 
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ message: "Failed to fetch categories" }, { status: res.status })
    }

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
    
    const res = await fetch(`${backendBase}/categories/create-category`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: auth 
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data || { message: "Failed to create category" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

