import { NextResponse } from "next/server";
import { sendThresholdAlert } from "@/lib/notification-service";
import { sendTelegramJamAlert } from "@/lib/telegram-service";

/**
 * Border Crossing Queue Estimator — TomTom Traffic Flow API
 * Replaces borderkiu.com scraping (legal risk) with official TomTom API.
 *
 * Strategy:
 *  currentSpeed / freeFlowSpeed → jam ratio
 *  currentTravelTime - freeFlowTravelTime → delay in seconds
 *  Delay mapped to estimated queue minutes using border overhead factor
 */

const TOMTOM_KEY = process.env.TOMTOM_API_KEY;
const BASE_URL = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json";
const ZOOM = 10;

/**
 * Border crossing road coordinates (lat, lon)
 * Each border crossing has TWO directional points:
 *   - [0]: outbound (Brunei side approach)
 *   - [1]: inbound (Malaysia side approach)
 */
const BORDER_POINTS: Record<string, { label: string; coords: [number, number] }[]> = {
    "Sungai Tujuh": [
        { label: "Brunei ➔ Miri", coords: [4.5878, 114.0753] },
        { label: "Miri ➔ Brunei", coords: [4.5892, 114.0731] },
    ],
    "Kuala Lurah": [
        { label: "Brunei ➔ Tedungan", coords: [4.7407, 114.8135] },
        { label: "Tedungan ➔ Brunei", coords: [4.7415, 114.8120] },
    ],
    "Ujung Jalan": [
        { label: "Brunei ➔ Pandaruan", coords: [4.8464, 115.0294] },
        { label: "Pandaruan ➔ Brunei", coords: [4.8471, 115.0281] },
    ],
    "Mengkalap": [
        { label: "Brunei ➔ Lawas", coords: [4.8711, 115.1118] },
        { label: "Lawas ➔ Brunei", coords: [4.8722, 115.1101] },
    ],
};

/**
 * Convert TomTom flow data to an estimated queue/wait time in minutes.
 *
 * Logic:
 *  1. jamFactor = 1 - (currentSpeed / freeFlowSpeed)   [0 = free, 1 = standstill]
 *  2. baseDelay = currentTravelTime - freeFlowTravelTime  [seconds of pure road delay]
 *  3. Border overhead: even at free-flow, there is customs/immigration processing.
 *     We assume a baseline of 5 min, scaling up with road jam severity.
 *  4. Queue estimate = BASELINE + roadDelayfactor * jamMultiplier
 */
function estimateQueueMinutes(
    currentSpeed: number,
    freeFlowSpeed: number,
    currentTravelTime: number,
    freeFlowTravelTime: number
): number {
    const safeFreeFlow = freeFlowSpeed > 0 ? freeFlowSpeed : 1;
    const jamFactor = 1 - Math.min(currentSpeed / safeFreeFlow, 1); // 0–1
    const roadDelaySeconds = Math.max(currentTravelTime - freeFlowTravelTime, 0);

    // Border processing baseline (minutes) even at free-flow
    const BASELINE_MIN = 5;
    // Jam multiplier: at jam=1 (standstill) → add up to 60 extra minutes
    const JAM_EXTRA_MIN = 60;
    // Road delay contribution (convert seconds to minutes, amplified for border queues)
    const roadDelayMin = (roadDelaySeconds / 60) * 2;

    const estimate = BASELINE_MIN + jamFactor * JAM_EXTRA_MIN + roadDelayMin;
    return Math.round(estimate);
}

function deriveStatus(queueMinutes: number): "smooth" | "moderate" | "congested" {
    if (queueMinutes <= 20) return "smooth";
    if (queueMinutes <= 45) return "moderate";
    return "congested";
}

interface BorderEntry {
    time: string;
    status: "smooth" | "moderate" | "congested";
    lastUpdated: string;
    speed?: number;
    freeFlowSpeed?: number;
    confidence?: number;
}

async function fetchFlow(lat: number, lon: number): Promise<{
    currentSpeed: number;
    freeFlowSpeed: number;
    currentTravelTime: number;
    freeFlowTravelTime: number;
    confidence: number;
}> {
    const url = `${BASE_URL}?point=${lat},${lon}&unit=KMPH&zoom=${ZOOM}&key=${TOMTOM_KEY}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`TomTom API error: ${res.status}`);
    const json = await res.json();
    const d = json.flowSegmentData;
    return {
        currentSpeed: d.currentSpeed,
        freeFlowSpeed: d.freeFlowSpeed,
        currentTravelTime: d.currentTravelTime,
        freeFlowTravelTime: d.freeFlowTravelTime,
        confidence: d.confidence,
    };
}

export async function GET() {
    if (!TOMTOM_KEY) {
        return NextResponse.json({ success: false, error: "TOMTOM_API_KEY not configured" }, { status: 500 });
    }

    const now = new Date();
    const lastUpdated = now.toLocaleTimeString("en-MY", {
        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuching",
    });

    const results: Record<string, BorderEntry> = {};
    const errors: string[] = [];

    for (const [, directions] of Object.entries(BORDER_POINTS)) {
        for (const { label, coords } of directions) {
            try {
                const flow = await fetchFlow(coords[0], coords[1]);
                const queueMin = estimateQueueMinutes(
                    flow.currentSpeed,
                    flow.freeFlowSpeed,
                    flow.currentTravelTime,
                    flow.freeFlowTravelTime
                );
                const status = deriveStatus(queueMin);

                results[label] = {
                    time: queueMin.toString(),
                    status,
                    lastUpdated,
                    speed: flow.currentSpeed,
                    freeFlowSpeed: flow.freeFlowSpeed,
                    confidence: flow.confidence,
                };

                // Trigger alerts if congested (>45 min)
                if (queueMin > 45) {
                    await sendThresholdAlert(label, queueMin.toString()).catch(() => { });
                    await sendTelegramJamAlert(label, queueMin, status, flow.currentSpeed, flow.freeFlowSpeed).catch(() => { });
                }
            } catch (err) {
                errors.push(label);
                // Fallback: return smooth with --
                results[label] = {
                    time: "---",
                    status: "smooth",
                    lastUpdated: "Unavailable",
                };
            }
        }
    }

    return NextResponse.json({
        success: true,
        data: results,
        source: "TomTom Traffic Flow API",
        updatedAt: now.toISOString(),
        ...(errors.length > 0 && { errors }),
    });
}
