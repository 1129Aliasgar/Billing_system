import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const backendBase = process.env.BACKEND_URL
  const res = await fetch(`${backendBase}/products/get-product/${id}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  if (!res.ok) return NextResponse.json({ message: "Not found" }, { status: res.status })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json()
  const backendBase = process.env.BACKEND_URL 
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
  const { id } = await params
  const res = await fetch(`${backendBase}/products/update-product/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendBase = process.env.BACKEND_URL
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
  const { id } = await params
  const res = await fetch(`${backendBase}/products/delete-product/${id}`, {
    method: "DELETE",
    headers: { Authorization: auth },
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}


