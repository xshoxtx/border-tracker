import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveImage, findNearestBorder, cleanOldSnaps } from "@/lib/upload";
import { checkRateLimit, getClientIp, sanitize } from "@/lib/rateLimit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RATE_LIMIT_MS = 15 * 60 * 1000;  // 15 minutes
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function GET() {
    try {
        cleanOldSnaps().catch(() => { });
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const snaps = await prisma.queueSnap.findMany({
            where: { hidden: false, createdAt: { gte: since } },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return NextResponse.json({ success: true, snaps });
    } catch (error) {
        console.error("Snaps fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch snaps" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // 🔐 IP rate limit: 1 snap per 15 minutes per IP (belt-and-suspenders with nickname check)
    const ip = getClientIp(req);
    const ipRl = checkRateLimit(ip, "snaps", 1, RATE_LIMIT_MS);
    if (!ipRl.allowed) {
        const waitMins = Math.ceil(ipRl.retryAfterMs / 60_000);
        return NextResponse.json(
            { success: false, error: `Please wait ${waitMins} more minutes before your next snap` },
            { status: 429 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("image") as File | null;
        const border = sanitize(formData.get("border") as string, 60);
        const lat = parseFloat(formData.get("lat") as string);
        const lng = parseFloat(formData.get("lng") as string);
        const nickname = sanitize((formData.get("nickname") as string) || "Traveler", 30);

        if (!file) {
            return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ success: false, error: "Only JPEG, PNG, WebP allowed" }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: "Image must be under 5MB" }, { status: 400 });
        }
        if (!border) {
            return NextResponse.json({ success: false, error: "Border name required" }, { status: 400 });
        }

        if (!isNaN(lat) && !isNaN(lng)) {
            const nearest = findNearestBorder(lat, lng, 10);
            if (!nearest) {
                return NextResponse.json({
                    success: false,
                    error: "You appear to be too far from any border crossing"
                }, { status: 400 });
            }
        }

        // Nickname-based rate limit (keep original check as second layer)
        const since = new Date(Date.now() - RATE_LIMIT_MS);
        const recentSnap = await prisma.queueSnap.findFirst({
            where: { nickname, createdAt: { gte: since } },
        });
        if (recentSnap) {
            const waitMins = Math.ceil((RATE_LIMIT_MS - (Date.now() - recentSnap.createdAt.getTime())) / 60000);
            return NextResponse.json(
                { success: false, error: `Please wait ${waitMins} more minutes before your next snap` },
                { status: 429 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const imageUrl = await saveImage(buffer, file.name);

        const snap = await prisma.queueSnap.create({
            data: {
                border,
                imageUrl,
                lat: isNaN(lat) ? null : lat,
                lng: isNaN(lng) ? null : lng,
                nickname,
            },
        });

        return NextResponse.json({ success: true, snap });
    } catch (error) {
        console.error("Snap upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload snap" }, { status: 500 });
    }
}
