import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/crossing — Fetch recent crossing reports (last 24h, limit 20)
 */
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

/**
 * POST /api/crossing — Submit a new crossing report
 * Body: { border: string, waitTime: string, note?: string }
 */
export async function POST(req: Request) {
    try {
        const { border, waitTime, note } = await req.json();
        if (!border || !waitTime) {
            return NextResponse.json({ success: false, error: "Missing border or waitTime" }, { status: 400 });
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
