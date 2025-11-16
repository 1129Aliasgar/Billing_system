import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""

    const res = await fetch(`${backendBase}/billing/get-bill/${id}`, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ message: "Bill not found" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
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

    // Check if it's a payment update or bill update
    const isPaymentUpdate = body.amount !== undefined
    const endpoint = isPaymentUpdate 
      ? `${backendBase}/billing/update-payment/${id}`
      : `${backendBase}/billing/update-bill/${id}`

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
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

    const res = await fetch(`${backendBase}/billing/delete-bill/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

