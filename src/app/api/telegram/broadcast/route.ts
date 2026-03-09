import { NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramSummary } from "@/lib/telegram-service";
import { checkInternalAuth } from "@/lib/rateLimit";

/**
 * POST /api/telegram/broadcast
 * 🔐 Requires Authorization: Bearer <INTERNAL_API_SECRET>
 */
export async function POST(request: Request) {
    // 🔐 Auth: only internal calls allowed
    if (!checkInternalAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        if (body.message) {
            if (typeof body.message !== "string" || body.message.length > 1000) {
                return NextResponse.json({ error: "Message must be a string, max 1000 chars" }, { status: 400 });
            }
            const sent = await sendTelegramMessage(body.message);
            return NextResponse.json({ success: sent });
        }

        if (body.action === "test") {
            const sent = await sendTelegramMessage(
                "✅ *BorderIQ Bot Connected!*\n\n" +
                "Border jam alerts will be sent to this channel automatically.\n\n" +
                "🌐 [Open BorderIQ](https://border.creativepresslab.com)"
            );
            return NextResponse.json({ success: sent });
        }

        if (body.action === "summary") {
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
