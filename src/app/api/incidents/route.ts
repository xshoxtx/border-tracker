import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findNearestBorder } from "@/lib/upload";

const RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const DISMISS_THRESHOLD = 2; // 2 dismissals = auto-resolve
const VALID_TYPES = ["system_down", "extra_counters", "road_closure", "other"];

/**
 * GET /api/incidents — Fetch active incidents (last 12h, not resolved, limit 10)
 */
export async function GET() {
    try {
        const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const incidents = await prisma.incidentReport.findMany({
            where: {
                resolved: false,
                createdAt: { gte: since },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        return NextResponse.json({ success: true, incidents });
    } catch (error) {
        console.error("Incidents fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch incidents" }, { status: 500 });
    }
}

/**
 * POST /api/incidents — Submit an incident report
 * Body: { border: string, type: string, note?: string, nickname?: string }
 */
export async function POST(req: Request) {
    try {
        const { border, type, note, nickname, lat, lng } = await req.json();

        if (!border || !type) {
            return NextResponse.json({ success: false, error: "Border and type required" }, { status: 400 });
        }
        if (!VALID_TYPES.includes(type)) {
            return NextResponse.json({ success: false, error: `Invalid type. Must be: ${VALID_TYPES.join(", ")}` }, { status: 400 });
        }

        // GPS validation — must be within 10km of any border
        if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
            return NextResponse.json({ success: false, error: "GPS location required to report incidents" }, { status: 400 });
        }
        const nearest = findNearestBorder(lat, lng, 10);
        if (!nearest) {
            return NextResponse.json({
                success: false,
                error: "You are too far from a border crossing to submit a report"
            }, { status: 400 });
        }

        const user = nickname || "Traveler";

        // Rate limit: 1 incident per 30 min per nickname
        const since = new Date(Date.now() - RATE_LIMIT_MS);
        const recent = await prisma.incidentReport.findFirst({
            where: {
                nickname: user,
                createdAt: { gte: since },
            },
        });
        if (recent) {
            const waitMins = Math.ceil((RATE_LIMIT_MS - (Date.now() - recent.createdAt.getTime())) / 60000);
            return NextResponse.json({
                success: false,
                error: `Please wait ${waitMins} more minutes before reporting again`
            }, { status: 429 });
        }

        const incident = await prisma.incidentReport.create({
            data: {
                border,
                type,
                note: note || null,
                nickname: user,
            },
        });

        return NextResponse.json({ success: true, incident });
    } catch (error) {
        console.error("Incident submit error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit incident" }, { status: 500 });
    }
}

/**
 * PATCH /api/incidents — Dismiss an incident report (community moderation)
 * Body: { incidentId: number }
 * 2 dismissals = auto-resolve
 */
export async function PATCH(req: Request) {
    try {
        const { incidentId } = await req.json();
        if (!incidentId || typeof incidentId !== "number") {
            return NextResponse.json({ success: false, error: "Valid incidentId required" }, { status: 400 });
        }

        const incident = await prisma.incidentReport.findUnique({ where: { id: incidentId } });
        if (!incident || incident.resolved) {
            return NextResponse.json({ success: false, error: "Incident not found or already resolved" }, { status: 404 });
        }

        // Use the note field to track dismiss count (append __DISMISS__)
        const currentNote = incident.note || "";
        const dismissCount = (currentNote.match(/__DISMISS__/g) || []).length + 1;
        const shouldResolve = dismissCount >= DISMISS_THRESHOLD;

        await prisma.incidentReport.update({
            where: { id: incidentId },
            data: {
                note: currentNote + "__DISMISS__",
                resolved: shouldResolve,
            },
        });

        return NextResponse.json({
            success: true,
            dismissed: dismissCount,
            resolved: shouldResolve,
        });
    } catch (error) {
        console.error("Dismiss error:", error);
        return NextResponse.json({ success: false, error: "Failed to dismiss incident" }, { status: 500 });
    }
}
