import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const FLAG_THRESHOLD = 3;

/**
 * POST /api/snaps/flag — Flag a snap for moderation
 * Body: { snapId: number }
 * 🔐 Rate limited: 1 flag per snap per IP (prevents malicious mass-flagging)
 */
export async function POST(req: Request) {
    const ip = getClientIp(req);

    try {
        const { snapId } = await req.json();
        if (!snapId || typeof snapId !== "number") {
            return NextResponse.json({ success: false, error: "Valid snapId required" }, { status: 400 });
        }

        // 🔐 Rate limit: 1 flag per snapId per IP per 24 hours
        const rl = checkRateLimit(ip, `flag:${snapId}`, 1, 24 * 60 * 60_000);
        if (!rl.allowed) {
            return NextResponse.json(
                { success: false, error: "You have already flagged this snap." },
                { status: 429 }
            );
        }

        // 🔐 General rate limit: max 10 flags per hour per IP (anti-mass-flagging)
        const globalRl = checkRateLimit(ip, "flag-global", 10, 60 * 60_000);
        if (!globalRl.allowed) {
            return NextResponse.json(
                { success: false, error: "Too many flag requests. Please try again later." },
                { status: 429 }
            );
        }

        const snap = await prisma.queueSnap.findUnique({ where: { id: snapId } });
        if (!snap) {
            return NextResponse.json({ success: false, error: "Snap not found" }, { status: 404 });
        }

        const newFlags = snap.flags + 1;
        const shouldHide = newFlags >= FLAG_THRESHOLD;

        await prisma.queueSnap.update({
            where: { id: snapId },
            data: { flags: newFlags, hidden: shouldHide },
        });

        return NextResponse.json({ success: true, flags: newFlags, hidden: shouldHide });
    } catch (error) {
        console.error("Flag error:", error);
        return NextResponse.json({ success: false, error: "Failed to flag snap" }, { status: 500 });
    }
}
