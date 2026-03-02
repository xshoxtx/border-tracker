import admin from "firebase-admin";
import path from "path";
import fs from "fs/promises";

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
        } catch (error) {
            console.error("Firebase Admin Init Error:", error);
        }
    }
}

export const sendThresholdAlert = async (borderName: string, time: string) => {
    try {
        await initAdmin();
        
        let tokens: string[] = [];
        try {
            const data = await fs.readFile(TOKENS_FILE, "utf-8");
            tokens = JSON.parse(data);
        } catch (e) {
            return;
        }

        if (tokens.length === 0) return;

        const payload = {
            notification: {
                title: "⚠️ High Traffic Alert",
                body: `Attention! Queue at ${borderName} has reached ${time} minutes. Plan your travel accordingly.`,
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(payload);
        console.log(`Auto-Alert sent to ${response.successCount} users for ${borderName}`);
    } catch (error) {
        console.error("Error sending threshold alert:", error);
    }
};
