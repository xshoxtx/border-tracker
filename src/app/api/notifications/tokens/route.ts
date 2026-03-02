import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TOKENS_FILE = path.join(process.cwd(), "src/data/tokens.json");

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

        // Ensure directory exists
        const dir = path.dirname(TOKENS_FILE);
        await fs.mkdir(dir, { recursive: true });

        let tokens: string[] = [];
        try {
            const data = await fs.readFile(TOKENS_FILE, "utf-8");
            tokens = JSON.parse(data);
        } catch (e) {
            // File doesn't exist yet
        }

        if (!tokens.includes(token)) {
            tokens.push(token);
            await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
            console.log("New FCM token registered");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Token registration error:", error);
        return NextResponse.json({ error: "Failed to register token" }, { status: 500 });
    }
}
