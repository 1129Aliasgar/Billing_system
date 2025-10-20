import { NextRequest , NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const url = new URL(req.url)
        const visibleOnly = url.searchParams.get('visible') === 'true'
        const backendRes = await fetch(`${process.env.BACKEND_URL}/products/get-products${visibleOnly ? '?visible=true' : ''}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })

        if(!backendRes.ok) {
            return NextResponse.json({ message: "Something went wrong" }, { status: backendRes.status })
        }

        const data = await backendRes.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}