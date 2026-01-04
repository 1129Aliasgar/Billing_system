import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const activeOnly = url.searchParams.get("activeOnly")
    
    let queryParams = []
    if (activeOnly === "true") queryParams.push("activeOnly=true")
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
    const backendRes = await fetch(`${process.env.BACKEND_URL}/categories/get-categories${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

