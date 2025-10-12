import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        if(!backendRes.ok) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: backendRes.status  })
        }

        const data = await backendRes.json()
        return NextResponse.json(data)
    }
    catch(err:any) {
        console.error("Proxy error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}