import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FLAG_THRESHOLD = 3;

/**
 * POST /api/snaps/flag — Flag a snap for moderation
 * Body: { snapId: number }
 * 3 flags = auto-hide
 */
export async function POST(req: Request) {
    try {
        const { snapId } = await req.json();
        if (!snapId || typeof snapId !== "number") {
            return NextResponse.json({ success: false, error: "Valid snapId required" }, { status: 400 });
        }

        const snap = await prisma.queueSnap.findUnique({ where: { id: snapId } });
        if (!snap) {
            return NextResponse.json({ success: false, error: "Snap not found" }, { status: 404 });
        }

        const newFlags = snap.flags + 1;
        const shouldHide = newFlags >= FLAG_THRESHOLD;

        await prisma.queueSnap.update({
            where: { id: snapId },
            data: {
                flags: newFlags,
                hidden: shouldHide,
            },
        });

        return NextResponse.json({
            success: true,
            flags: newFlags,
            hidden: shouldHide,
        });
    } catch (error) {
        console.error("Flag error:", error);
        return NextResponse.json({ success: false, error: "Failed to flag snap" }, { status: 500 });
    }
}
