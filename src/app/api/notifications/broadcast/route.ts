import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import admin from "firebase-admin";
import { checkInternalAuth } from "@/lib/rateLimit";

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "firebase-admin.json");
const TOKENS_FILE = path.join(process.cwd(), "src/data/tokens.json");

async function initAdmin() {
    if (!admin.apps.length) {
        try {
            const data = await fs.readFile(SERVICE_ACCOUNT_PATH, "utf-8");
            const serviceAccount = JSON.parse(data);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        } catch (error) {
            console.error("Firebase Admin Init Error:", error);
            throw error;
        }
    }
}

export async function POST(req: Request) {
    // 🔐 Auth: only internal calls with INTERNAL_API_SECRET allowed
    if (!checkInternalAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await initAdmin();
        const { title, message } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Title and Message required" }, { status: 400 });
        }
        // Limit title/message length
        if (title.length > 100 || message.length > 500) {
            return NextResponse.json({ error: "Title max 100 chars, message max 500 chars" }, { status: 400 });
        }

        let tokens: string[] = [];
        try {
            const data = await fs.readFile(TOKENS_FILE, "utf-8");
            tokens = JSON.parse(data);
        } catch {
            return NextResponse.json({ success: true, sentCount: 0, message: "No subscribers found (file missing)" });
        }

        if (tokens.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0, message: "No subscribers found" });
        }

        const payload = {
            notification: { title, body: message },
            tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(payload);

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) failedTokens.push(tokens[idx]);
            });
            if (failedTokens.length > 0) {
                const remainingTokens = tokens.filter(t => !failedTokens.includes(t));
                await fs.writeFile(TOKENS_FILE, JSON.stringify(remainingTokens, null, 2));
            }
        }

        return NextResponse.json({
            success: true,
            sentCount: response.successCount,
            message: `Broadcast delivered successfully`,
        });
    } catch (error: any) {
        console.error("Broadcast error:", error);
        return NextResponse.json({ error: "Failed to send broadcast: " + (error?.message || "Unknown error") }, { status: 500 });
    }
}
