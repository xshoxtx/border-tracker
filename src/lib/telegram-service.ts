/**
 * Telegram Bot Service — Pathfinder Border Intelligence
 *
 * Sends border jam alerts to @borderbrunei channel via Telegram Bot API.
 * Bot: @Intelligentborderbot
 *
 * Features:
 *  - Auto-alert when any border > 45 min queue
 *  - Cooldown to prevent spam (15 min between same-border alerts)
 *  - Formatted with emojis for mobile readability
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─── Cooldown: prevent spamming the same alert ───
// Map of "borderLabel" → last alert timestamp
const alertCooldowns = new Map<string, number>();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

function isOnCooldown(borderLabel: string): boolean {
    const last = alertCooldowns.get(borderLabel);
    if (!last) return false;
    return Date.now() - last < COOLDOWN_MS;
}

function setCooldown(borderLabel: string): void {
    alertCooldowns.set(borderLabel, Date.now());
}

// ─── Status emoji mapper ───
function statusEmoji(status: string): string {
    switch (status) {
        case "congested": return "🔴";
        case "moderate": return "🟡";
        default: return "🟢";
    }
}

// ─── Format a traffic alert message ───
function formatAlertMessage(
    borderLabel: string,
    queueMinutes: number,
    status: string,
    speed?: number,
    freeFlowSpeed?: number
): string {
    const emoji = statusEmoji(status);
    const now = new Date().toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kuching",
    });

    let msg = `${emoji} *TRAFFIC ALERT*\n\n`;
    msg += `📍 *${borderLabel}*\n`;
    msg += `⏱ Est. wait: *~${queueMinutes} min*\n`;
    msg += `🚦 Status: *${status.toUpperCase()}*\n`;

    if (speed !== undefined && freeFlowSpeed !== undefined) {
        msg += `🚗 Speed: ${speed} km/h (normal: ${freeFlowSpeed} km/h)\n`;
    }

    msg += `\n🕐 Updated: ${now} (Brunei/Miri time)`;
    msg += `\n\n💡 _Tip: Cross early morning (6-8 AM) for shortest queues_`;
    msg += `\n\n🌐 [Open Pathfinder App](https://border.creativepresslab.com)`;

    return msg;
}

// ─── Format a summary message (all borders) ───
function formatSummaryMessage(
    borders: { label: string; queueMinutes: number; status: string }[]
): string {
    const now = new Date().toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kuching",
    });

    let msg = `📊 *BORDER STATUS UPDATE*\n`;
    msg += `🕐 ${now} (Brunei/Miri time)\n\n`;

    borders.forEach((b) => {
        const emoji = statusEmoji(b.status);
        msg += `${emoji} *${b.label}*: ~${b.queueMinutes} min\n`;
    });

    msg += `\n🌐 [Live updates → Pathfinder](https://border.creativepresslab.com)`;

    return msg;
}

// ─── Send message to channel ───
export async function sendTelegramMessage(text: string): Promise<boolean> {
    if (!BOT_TOKEN || !CHANNEL_ID) {
        console.error("Telegram: BOT_TOKEN or CHANNEL_ID not configured");
        return false;
    }

    try {
        const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text,
                parse_mode: "Markdown",
                disable_web_page_preview: true,
            }),
        });

        const data = await res.json();
        if (!data.ok) {
            console.error("Telegram send error:", data.description);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Telegram send failed:", err);
        return false;
    }
}

// ─── Auto-alert: called from border API when congested ───
export async function sendTelegramJamAlert(
    borderLabel: string,
    queueMinutes: number,
    status: string,
    speed?: number,
    freeFlowSpeed?: number
): Promise<void> {
    // Only alert for congested (>45 min)
    if (queueMinutes <= 45) return;

    // Check cooldown
    if (isOnCooldown(borderLabel)) {
        console.log(`Telegram: ${borderLabel} alert on cooldown, skipping`);
        return;
    }

    const message = formatAlertMessage(borderLabel, queueMinutes, status, speed, freeFlowSpeed);
    const sent = await sendTelegramMessage(message);

    if (sent) {
        setCooldown(borderLabel);
        console.log(`Telegram: Alert sent for ${borderLabel} (~${queueMinutes} min)`);
    }
}

// ─── Broadcast summary of all borders ───
export async function sendTelegramSummary(
    borders: { label: string; queueMinutes: number; status: string }[]
): Promise<boolean> {
    const message = formatSummaryMessage(borders);
    return sendTelegramMessage(message);
}
