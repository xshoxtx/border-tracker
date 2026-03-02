import { NextResponse } from "next/server";

/**
 * GET /api/v1/borders — Public API for border status data
 * 
 * Returns real-time border queue estimates from TomTom Traffic Flow API.
 * Open for developers — no auth required.
 * 
 * Response:
 * {
 *   success: true,
 *   version: "1.0",
 *   borders: { "Brunei ➔ Miri": { time: "12", status: "smooth", ... }, ... },
 *   updatedAt: "2026-02-27T21:00:00.000Z",
 *   source: "TomTom Traffic Flow API"
 * }
 */
export async function GET(request: Request) {
    try {
        // Fetch from internal border API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
        const res = await fetch(`${baseUrl}/api/border`, { cache: "no-store" });
        const json = await res.json();

        if (!json.success) {
            return NextResponse.json(
                { success: false, error: "Upstream data unavailable" },
                { status: 502, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            {
                success: true,
                version: "1.0",
                borders: json.data,
                updatedAt: json.updatedAt,
                source: json.source,
                documentation: "https://border.creativepresslab.com",
            },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Public API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal error" },
            { status: 500, headers: corsHeaders() }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60",
    };
}
