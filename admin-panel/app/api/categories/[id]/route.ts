import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const backendBase = process.env.BACKEND_URL
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
    
    const res = await fetch(`${backendBase}/categories/update-category/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: auth 
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data || { message: "Failed to update category" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
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
    
    const res = await fetch(`${backendBase}/categories/delete-category/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data || { message: "Failed to delete category" }, { status: res.status })
    }

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

