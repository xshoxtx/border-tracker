import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || "BND";
    const to = searchParams.get("to") || "MYR";

    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) throw new Error("API response not OK");

        const data = await res.json();
        const rate = data.rates?.[to];

        if (!rate) throw new Error(`Rate not found for ${to}`);

        return NextResponse.json({
            success: true,
            from,
            to,
            rate,
            updated: data.time_last_update_utc || new Date().toISOString(),
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    } catch (error: any) {
        // Return fallback rates so the widget always has data
        const fallbackRates: Record<string, Record<string, number>> = {
            BND: { MYR: 3.08 },
            MYR: { BND: 0.325 },
        };

        const fallbackRate = fallbackRates[from]?.[to] || 1;

        return NextResponse.json({
            success: false,
            from,
            to,
            rate: fallbackRate,
            fallback: true,
            updated: new Date().toISOString(),
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    }
}
