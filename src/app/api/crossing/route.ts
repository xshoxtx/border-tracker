import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, sanitize } from "@/lib/rateLimit";

const VALID_BORDERS = [
    "Brunei ➔ Miri", "Miri ➔ Brunei",
    "Brunei ➔ Kuala Lurah", "Kuala Lurah ➔ Brunei",
    "Brunei ➔ Pandaruan", "Pandaruan ➔ Brunei",
    "Brunei ➔ Lawas", "Lawas ➔ Brunei",
];

export async function GET() {
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const reports = await prisma.crossingReport.findMany({
            where: { createdAt: { gte: since } },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return NextResponse.json({ success: true, reports });
    } catch (error) {
        console.error("Crossing fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // 🔐 IP rate limit: 3 submissions per 10 minutes
    const ip = getClientIp(req);
    const rl = checkRateLimit(ip, "crossing", 3, 10 * 60_000);
    if (!rl.allowed) {
        const waitMins = Math.ceil(rl.retryAfterMs / 60_000);
        return NextResponse.json(
            { success: false, error: `Please wait ${waitMins} more minutes before submitting again.` },
            { status: 429 }
        );
    }

    try {
        const body = await req.json();

        const border = sanitize(body.border, 50);
        const waitTime = sanitize(body.waitTime, 30);
        const note = sanitize(body.note, 300);

        if (!border || !waitTime) {
            return NextResponse.json({ success: false, error: "Missing border or waitTime" }, { status: 400 });
        }
        // Validate border name against whitelist
        if (!VALID_BORDERS.includes(border)) {
            return NextResponse.json({ success: false, error: "Invalid border name" }, { status: 400 });
        }

        const report = await prisma.crossingReport.create({
            data: { border, waitTime, note: note || null },
        });

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Crossing submit error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit report" }, { status: 500 });
    }
}
