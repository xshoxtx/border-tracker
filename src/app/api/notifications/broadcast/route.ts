import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import admin from "firebase-admin";

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "firebase-admin.json");
const TOKENS_FILE = path.join(process.cwd(), "src/data/tokens.json");

async function initAdmin() {
    if (!admin.apps.length) {
        try {
            const data = await fs.readFile(SERVICE_ACCOUNT_PATH, "utf-8");
            const serviceAccount = JSON.parse(data);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin Initialized");
        } catch (error) {
            console.error("Firebase Admin Init Error:", error);
            throw error;
        }
    }
}

export async function POST(req: Request) {
    try {
        await initAdmin();
        const { title, message } = await req.json();
        
        if (!title || !message) {
            return NextResponse.json({ error: "Title and Message required" }, { status: 400 });
        }

        let tokens: string[] = [];
        try {
            const data = await fs.readFile(TOKENS_FILE, "utf-8");
            tokens = JSON.parse(data);
        } catch (e) {
            return NextResponse.json({ success: true, sentCount: 0, message: "No subscribers found (file missing)" });
        }

        if (tokens.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0, message: "No subscribers found" });
        }

        const payload = {
            notification: {
                title: title,
                body: message,
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(payload);
        
        console.log(`Successfully sent broadcast to ${response.successCount} users.`);

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            
            if (failedTokens.length > 0) {
                const remainingTokens = tokens.filter(t => !failedTokens.includes(t));
                await fs.writeFile(TOKENS_FILE, JSON.stringify(remainingTokens, null, 2));
            }
        }
        
        return NextResponse.json({ 
            success: true, 
            sentCount: response.successCount,
            message: `Broadcast delivered successfully` 
        });
    } catch (error: any) {
        console.error("Broadcast error:", error);
        return NextResponse.json({ error: "Failed to send broadcast: " + (error?.message || "Unknown error") }, { status: 500 });
    }
}
