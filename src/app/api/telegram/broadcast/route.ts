import { NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramSummary } from "@/lib/telegram-service";

/**
 * POST /api/telegram/broadcast
 *
 * Manual broadcast endpoint. Send a custom message or border summary
 * to @borderbrunei Telegram channel.
 *
 * Body options:
 *  { "message": "Custom text here" }          → sends raw text
 *  { "action": "summary" }                    → fetches current border data and sends summary
 *  { "action": "test" }                       → sends a test ping
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Option 1: Custom message
        if (body.message) {
            const sent = await sendTelegramMessage(body.message);
            return NextResponse.json({ success: sent });
        }

        // Option 2: Action-based
        if (body.action === "test") {
            const sent = await sendTelegramMessage(
                "✅ *Pathfinder Bot Connected!*\n\n" +
                "Border jam alerts will be sent to this channel automatically.\n\n" +
                "🌐 [Open Pathfinder](https://border.creativepresslab.com)"
            );
            return NextResponse.json({ success: sent });
        }

        if (body.action === "summary") {
            // Fetch current border data from our own API
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";
            const res = await fetch(`${baseUrl}/api/border`);
            const json = await res.json();

            if (!json.success) {
                return NextResponse.json({ success: false, error: "Failed to fetch border data" });
            }

            const borders = Object.entries(json.data).map(([label, data]: [string, any]) => ({
                label,
                queueMinutes: parseInt(data.time) || 0,
                status: data.status as string,
            }));

            const sent = await sendTelegramSummary(borders);
            return NextResponse.json({ success: sent });
        }

        return NextResponse.json({ success: false, error: "Missing 'message' or 'action' in body" }, { status: 400 });
    } catch (err) {
        console.error("Telegram broadcast error:", err);
        return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
    }
}
