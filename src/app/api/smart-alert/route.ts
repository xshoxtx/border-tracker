import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Smart Alert: Check if queue dropped below user threshold ───
// Called by the cron job after collecting data, or manually.
// Finds FCM tokens subscribed to alerts and sends push notifications.

const BORDER_POINTS: Record<string, { label: string; coords: [number, number] }[]> = {
    "Sungai Tujuh": [
        { label: "Brunei ➔ Miri", coords: [4.5852, 114.0723] },
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

const TOMTOM_KEY = process.env.TOMTOM_API_KEY!;

async function getQueueMinutes(lat: number, lng: number): Promise<number> {
    try {
        const res = await fetch(
            `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lng}&key=${TOMTOM_KEY}`,
            { cache: "no-store" }
        );
        const data = await res.json();
        const speed = data?.flowSegmentData?.currentSpeed || 0;
        const freeFlow = data?.flowSegmentData?.freeFlowSpeed || 1;
        const ratio = speed / freeFlow;

        if (ratio >= 0.8) return 5;
        if (ratio >= 0.5) return 15;
        if (ratio >= 0.3) return 30;
        return 45;
    } catch {
        return -1;
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check current queue times
    const alerts: { border: string; queueMin: number }[] = [];

    for (const [, directions] of Object.entries(BORDER_POINTS)) {
        for (const dir of directions) {
            const mins = await getQueueMinutes(dir.coords[0], dir.coords[1]);
            if (mins > 0 && mins <= 10) {
                alerts.push({ border: dir.label, queueMin: mins });
            }
        }
    }

    if (alerts.length === 0) {
        return NextResponse.json({
            success: true,
            message: "No borders below threshold",
            alerts: [],
        });
    }

    // Get all FCM tokens
    const tokens = await prisma.fcmToken.findMany({
        select: { token: true },
    });

    if (tokens.length === 0) {
        return NextResponse.json({
            success: true,
            message: "Alerts found but no subscribers",
            alerts,
            notified: 0,
        });
    }

    // Send push notifications via FCM
    let notified = 0;
    const firebaseAdmin = process.env.FIREBASE_ADMIN_SDK_JSON;
    if (!firebaseAdmin) {
        return NextResponse.json({
            success: true,
            message: "Firebase not configured",
            alerts,
            notified: 0,
        });
    }

    try {
        // Dynamic import to avoid build issues when firebase not configured
        const admin = await import("firebase-admin");
        if (!admin.apps?.length) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(firebaseAdmin)),
            });
        }

        const borderList = alerts.map(a => `${a.border}: ~${a.queueMin} min`).join(", ");
        const message = {
            notification: {
                title: "🟢 Queue is Clear!",
                body: `${borderList}. Go now for minimal wait!`,
            },
            data: {
                type: "smart_departure",
                borders: JSON.stringify(alerts),
            },
        };

        for (const { token } of tokens) {
            try {
                await admin.messaging().send({ ...message, token });
                notified++;
            } catch {
                // Token expired or invalid — clean up
                await prisma.fcmToken.deleteMany({ where: { token } });
            }
        }
    } catch (err) {
        console.error("FCM error:", err);
    }

    return NextResponse.json({
        success: true,
        alerts,
        notified,
        totalTokens: tokens.length,
    });
}
