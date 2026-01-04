import { NextRequest , NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const url = new URL(req.url)
        const visibleOnly = url.searchParams.get('visible') === 'true'
        const category = url.searchParams.get('category')
        
        let queryParams = []
        if (visibleOnly) queryParams.push('visible=true')
        if (category) queryParams.push(`category=${encodeURIComponent(category)}`)
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
        const backendRes = await fetch(`${process.env.BACKEND_URL}/products/get-products${queryString}`, {
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