import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findNearestBorder } from "@/lib/upload";
import { checkRateLimit, getClientIp, sanitize } from "@/lib/rateLimit";

const RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const DISMISS_THRESHOLD = 2;
const VALID_TYPES = ["system_down", "extra_counters", "road_closure", "other"];

export async function GET() {
    try {
        const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const incidents = await prisma.incidentReport.findMany({
            where: { resolved: false, createdAt: { gte: since } },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        return NextResponse.json({ success: true, incidents });
    } catch (error) {
        console.error("Incidents fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch incidents" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // 🔐 IP rate limit: 2 incidents per 30 minutes per IP
    const ip = getClientIp(req);
    const ipRl = checkRateLimit(ip, "incidents", 2, RATE_LIMIT_MS);
    if (!ipRl.allowed) {
        const waitMins = Math.ceil(ipRl.retryAfterMs / 60_000);
        return NextResponse.json(
            { success: false, error: `Please wait ${waitMins} more minutes before reporting again` },
            { status: 429 }
        );
    }

    try {
        const body = await req.json();

        const border = sanitize(body.border, 60);
        const type = sanitize(body.type, 30);
        const note = sanitize(body.note, 300);
        const nickname = sanitize(body.nickname || "Traveler", 30);
        const lat = body.lat;
        const lng = body.lng;

        if (!border || !type) {
            return NextResponse.json({ success: false, error: "Border and type required" }, { status: 400 });
        }
        if (!VALID_TYPES.includes(type)) {
            return NextResponse.json({ success: false, error: `Invalid type. Must be: ${VALID_TYPES.join(", ")}` }, { status: 400 });
        }

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

        // Nickname-based rate limit (second layer)
        const since = new Date(Date.now() - RATE_LIMIT_MS);
        const recent = await prisma.incidentReport.findFirst({
            where: { nickname, createdAt: { gte: since } },
        });
        if (recent) {
            const waitMins = Math.ceil((RATE_LIMIT_MS - (Date.now() - recent.createdAt.getTime())) / 60000);
            return NextResponse.json(
                { success: false, error: `Please wait ${waitMins} more minutes before reporting again` },
                { status: 429 }
            );
        }

        const incident = await prisma.incidentReport.create({
            data: { border, type, note: note || null, nickname },
        });

        return NextResponse.json({ success: true, incident });
    } catch (error) {
        console.error("Incident submit error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit incident" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    // 🔐 IP rate limit: 5 dismissals per hour
    const ip = getClientIp(req);
    const rl = checkRateLimit(ip, "dismiss", 5, 60 * 60_000);
    if (!rl.allowed) {
        return NextResponse.json(
            { success: false, error: "Too many dismissal requests. Try again later." },
            { status: 429 }
        );
    }

    try {
        const { incidentId } = await req.json();
        if (!incidentId || typeof incidentId !== "number") {
            return NextResponse.json({ success: false, error: "Valid incidentId required" }, { status: 400 });
        }

        const incident = await prisma.incidentReport.findUnique({ where: { id: incidentId } });
        if (!incident || incident.resolved) {
            return NextResponse.json({ success: false, error: "Incident not found or already resolved" }, { status: 404 });
        }

        const currentNote = incident.note || "";
        const dismissCount = (currentNote.match(/__DISMISS__/g) || []).length + 1;
        const shouldResolve = dismissCount >= DISMISS_THRESHOLD;

        await prisma.incidentReport.update({
            where: { id: incidentId },
            data: { note: currentNote + "__DISMISS__", resolved: shouldResolve },
        });

        return NextResponse.json({ success: true, dismissed: dismissCount, resolved: shouldResolve });
    } catch (error) {
        console.error("Dismiss error:", error);
        return NextResponse.json({ success: false, error: "Failed to dismiss incident" }, { status: 500 });
    }
}
