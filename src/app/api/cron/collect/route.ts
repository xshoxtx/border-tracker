import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Hourly Cron Job — Collects TomTom traffic data for all border crossings.
 * Stores snapshots in QueueHistory for heatmap + prediction features.
 *
 * Trigger via cPanel cron:
 *   wget -qO- "https://border.creativepresslab.com/api/cron/collect?secret=YOUR_SECRET"
 *
 * Budget: 8 requests per run × 24 runs/day = 192 req/day
 */

const TOMTOM_KEY = process.env.TOMTOM_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json";

const BORDER_POINTS: Record<string, { label: string; coords: [number, number] }[]> = {
    "Sungai Tujuh": [
        { label: "Brunei ➔ Miri", coords: [4.5878, 114.0753] },
        { label: "Miri ➔ Brunei", coords: [4.5892, 114.0731] },
    ],
    "Kuala Lurah": [
        { label: "Brunei ➔ Kuala Lurah", coords: [4.74170, 114.81374] },
        { label: "Kuala Lurah ➔ Brunei", coords: [4.73604, 114.81055] },
    ],
    "Ujung Jalan": [
        { label: "Brunei ➔ Pandaruan", coords: [4.6890, 115.0393] },
        { label: "Pandaruan ➔ Brunei", coords: [4.6895, 115.0380] },
    ],
    "Mengkalap": [
        { label: "Brunei ➔ Lawas", coords: [4.7933, 115.2363] },
        { label: "Lawas ➔ Brunei", coords: [4.7940, 115.2350] },
    ],
};

function estimateQueueMinutes(
    currentSpeed: number,
    freeFlowSpeed: number,
    currentTravelTime: number,
    freeFlowTravelTime: number
): number {
    const safeFreeFlow = freeFlowSpeed > 0 ? freeFlowSpeed : 1;
    const jamFactor = 1 - Math.min(currentSpeed / safeFreeFlow, 1);
    const roadDelaySeconds = Math.max(currentTravelTime - freeFlowTravelTime, 0);
    const BASELINE_MIN = 5;
    const JAM_EXTRA_MIN = 60;
    const roadDelayMin = (roadDelaySeconds / 60) * 2;
    return Math.round(BASELINE_MIN + jamFactor * JAM_EXTRA_MIN + roadDelayMin);
}

function deriveStatus(queueMinutes: number): "smooth" | "moderate" | "congested" {
    if (queueMinutes <= 20) return "smooth";
    if (queueMinutes <= 45) return "moderate";
    return "congested";
}

export async function GET(req: Request) {
    // Auth check
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (!CRON_SECRET || secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!TOMTOM_KEY) {
        return NextResponse.json({ error: "TOMTOM_API_KEY not configured" }, { status: 500 });
    }

    // Get current time in Asia/Kuching
    const now = new Date();
    const kuchingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuching" }));
    const dayOfWeek = kuchingTime.getDay(); // 0=Sun
    const hour = kuchingTime.getHours();

    const collected: string[] = [];
    const errors: string[] = [];

    for (const [, directions] of Object.entries(BORDER_POINTS)) {
        for (const { label, coords } of directions) {
            try {
                const url = `${BASE_URL}?point=${coords[0]},${coords[1]}&unit=KMPH&zoom=10&key=${TOMTOM_KEY}`;
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json = await res.json();
                const d = json.flowSegmentData;

                const queueMinutes = estimateQueueMinutes(
                    d.currentSpeed, d.freeFlowSpeed,
                    d.currentTravelTime, d.freeFlowTravelTime
                );

                await prisma.queueHistory.create({
                    data: {
                        border: label,
                        queueMinutes,
                        status: deriveStatus(queueMinutes),
                        speed: d.currentSpeed,
                        freeFlowSpeed: d.freeFlowSpeed,
                        dayOfWeek,
                        hour,
                    },
                });

                collected.push(label);
            } catch (err) {
                errors.push(label);
            }
        }
    }

    // Cleanup: delete records older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const deleted = await prisma.queueHistory.deleteMany({
        where: { createdAt: { lt: cutoff } },
    });

    // Chain: trigger smart departure alerts
    let alertResult = null;
    try {
        const baseUrl = req.url.split("/api/")[0];
        const alertRes = await fetch(
            `${baseUrl}/api/smart-alert?secret=${CRON_SECRET}`,
            { cache: "no-store" }
        );
        alertResult = await alertRes.json();
    } catch (err) {
        alertResult = { error: "Failed to trigger smart alerts" };
    }

    return NextResponse.json({
        success: true,
        collected: collected.length,
        borders: collected,
        errors: errors.length > 0 ? errors : undefined,
        cleanup: deleted.count,
        smartAlert: alertResult,
        timestamp: now.toISOString(),
        dayOfWeek,
        hour,
    });
}
