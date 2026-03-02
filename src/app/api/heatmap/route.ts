import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Queue Heatmap API
 * Aggregates QueueHistory data into a 7-day × 24-hour grid
 * showing average queue minutes per slot.
 *
 * GET /api/heatmap?border=Brunei+➔+Miri
 */

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const border = searchParams.get("border") || "Brunei ➔ Miri";

    try {
        // Get all history for this border
        const records = await prisma.queueHistory.findMany({
            where: { border },
            select: {
                dayOfWeek: true,
                hour: true,
                queueMinutes: true,
            },
        });

        if (records.length === 0) {
            return NextResponse.json({
                success: true,
                border,
                grid: null,
                message: "No historical data yet — collecting hourly. Check back in 24hr.",
                totalRecords: 0,
            });
        }

        // Aggregate: avg queue per (dayOfWeek, hour) slot
        const slotMap: Record<string, { total: number; count: number }> = {};

        for (const r of records) {
            const key = `${r.dayOfWeek}-${r.hour}`;
            if (!slotMap[key]) slotMap[key] = { total: 0, count: 0 };
            slotMap[key].total += r.queueMinutes;
            slotMap[key].count += 1;
        }

        // Build 7×24 grid
        const grid: { day: number; hour: number; avg: number; count: number }[] = [];
        let bestSlot = { day: 0, hour: 0, avg: Infinity };
        let worstSlot = { day: 0, hour: 0, avg: 0 };

        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                const key = `${day}-${hour}`;
                const slot = slotMap[key];
                const avg = slot ? Math.round(slot.total / slot.count) : 0;
                const count = slot ? slot.count : 0;

                grid.push({ day, hour, avg, count });

                if (count > 0 && avg < bestSlot.avg) {
                    bestSlot = { day, hour, avg };
                }
                if (avg > worstSlot.avg) {
                    worstSlot = { day, hour, avg };
                }
            }
        }

        return NextResponse.json({
            success: true,
            border,
            grid,
            best: bestSlot,
            worst: worstSlot,
            totalRecords: records.length,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch heatmap data" }, { status: 500 });
    }
}
