import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch("https://krystal-solutional-cherish.ngrok-free.dev/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Failed to connect to server" },
            { status: 500 }
        );
    }
}
