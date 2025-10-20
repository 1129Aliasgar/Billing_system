import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backendBase = process.env.BACKEND_URL;
    const backendRes = await fetch(`${backendBase}/products/get-product/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!backendRes.ok) {
      const status = backendRes.status
      const message = status === 404 ? "Product not found" : "Something went wrong"
      return NextResponse.json({ message }, { status })
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
    const backendRes = await fetch(`${backendBase}/products/update-product/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: auth, authorization: auth },
      body: JSON.stringify(body),
    })
    const data = await backendRes.json().catch(() => ({}))
    return NextResponse.json(data, { status: backendRes.status })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
    const backendRes = await fetch(`${backendBase}/products/delete-product/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth, authorization: auth },
    })
    const data = await backendRes.json().catch(() => ({}))
    return NextResponse.json(data, { status: backendRes.status })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}


