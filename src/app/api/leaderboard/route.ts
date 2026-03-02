import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ContributorEntry {
    nickname: string;
    crossings: number;
    snaps: number;
    total: number;
    badge: string;
}

function getBadge(total: number): string {
    if (total >= 50) return "diamond";
    if (total >= 25) return "gold";
    if (total >= 10) return "silver";
    if (total >= 3) return "bronze";
    return "none";
}

/**
 * GET /api/leaderboard — Top 10 contributors from last 7 days
 * Aggregates CrossingReport + QueueSnap counts per nickname
 */
export async function GET() {
    try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get crossing report counts by border (nickname not stored in CrossingReport)
        // CrossingReport doesn't have nickname, so we count from QueueSnap + IncidentReport
        // We'll also count chat messages as contributions

        // QueueSnap contributions
        const snapCounts = await prisma.queueSnap.groupBy({
            by: ["nickname"],
            where: { createdAt: { gte: since }, hidden: false },
            _count: { id: true },
        });

        // IncidentReport contributions (counts as crossing-like contribution)
        const incidentCounts = await prisma.incidentReport.groupBy({
            by: ["nickname"],
            where: { createdAt: { gte: since } },
            _count: { id: true },
        });

        // ChatMessage contributions
        const chatCounts = await prisma.chatMessage.groupBy({
            by: ["user"],
            where: { createdAt: { gte: since } },
            _count: { id: true },
        });

        // Merge all counts
        const contributorMap = new Map<string, { crossings: number; snaps: number }>();

        for (const s of snapCounts) {
            const key = s.nickname;
            const cur = contributorMap.get(key) || { crossings: 0, snaps: 0 };
            cur.snaps += s._count.id;
            contributorMap.set(key, cur);
        }

        for (const i of incidentCounts) {
            const key = i.nickname;
            const cur = contributorMap.get(key) || { crossings: 0, snaps: 0 };
            cur.crossings += i._count.id;
            contributorMap.set(key, cur);
        }

        for (const c of chatCounts) {
            const key = c.user;
            if (key === "Traveler") continue; // Skip anonymous crossing auto-posts
            const cur = contributorMap.get(key) || { crossings: 0, snaps: 0 };
            cur.crossings += c._count.id;
            contributorMap.set(key, cur);
        }

        // Build sorted leaderboard
        const leaderboard: ContributorEntry[] = Array.from(contributorMap.entries())
            .map(([nickname, counts]) => ({
                nickname,
                crossings: counts.crossings,
                snaps: counts.snaps,
                total: counts.crossings + counts.snaps,
                badge: getBadge(counts.crossings + counts.snaps),
            }))
            .filter((e) => e.total > 0)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        return NextResponse.json({ success: true, leaderboard });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
