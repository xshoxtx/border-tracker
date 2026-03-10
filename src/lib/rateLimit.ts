/**
 * rateLimit.ts — In-memory IP-based rate limiter
 * No Redis required. Resets on server restart (acceptable for this use case).
 *
 * Usage:
 *   const result = checkRateLimit(ip, 'chat', 5, 60_000); // 5 req/min
 *   if (!result.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Store: key = `${ip}:${bucket}`, value = { count, resetAt }
const store = new Map<string, RateLimitEntry>();

// Ban store: key = IP, value = unban timestamp
const banStore = new Map<string, number>();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
    }
    for (const [ip, unbanAt] of banStore.entries()) {
        if (unbanAt < now) banStore.delete(ip);
    }
}, 5 * 60 * 1000);

/**
 * Check if request is within rate limit.
 * @param ip - Client IP address
 * @param bucket - Unique bucket name for this endpoint
 * @param maxRequests - Max allowed requests in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
    ip: string,
    bucket: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const key = `${ip}:${bucket}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
        // First request in window
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: entry.resetAt - now,
        };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

/**
 * Get client IP from Next.js request headers.
 * Handles proxies (Cloudflare, Nginx, Apache).
 */
export function getClientIp(req: Request): string {
    const headers = req.headers;
    return (
        headers.get("cf-connecting-ip") ||           // Cloudflare
        headers.get("x-real-ip") ||                  // Nginx
        headers.get("x-forwarded-for")?.split(",")[0].trim() || // Apache proxy
        "unknown"
    );
}

/**
 * Sanitize a string: trim, strip HTML tags, limit length.
 */
export function sanitize(input: string | null | undefined, maxLen: number): string {
    if (!input) return "";
    return input
        .trim()
        .replace(/<[^>]*>/g, "") // strip HTML
        .slice(0, maxLen);
}

/**
 * Validate Authorization: Bearer <secret> header against env var.
 */
export function checkInternalAuth(req: Request): boolean {
    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) return false;
    const auth = req.headers.get("authorization");
    return auth === `Bearer ${secret}`;
}

/**
 * Bad words filter — English + Malay/Brunei profanity.
 * Uses word-boundary matching to avoid false positives.
 * Returns true if the text contains any bad words.
 * 
 * Sources: LDNOOBW GitHub, Malay profanity research, Brunei/Sarawak dialect.
 * Last updated: 2026-03-10
 */
const BAD_WORDS = [
    // ── English: Core profanity + variations ──
    "fuck", "fucking", "fucked", "fucker", "fuckers", "fucks", "fucktard", "fucktards",
    "fck", "fuk", "fuc", "fuq", "phuck", "phuk", "fking", "fkn", "effing",
    "shit", "shitty", "bullshit", "shits", "shitting", "dipshit", "horseshit", "apeshit",
    "sht", "sh1t", "shiit",
    "ass", "asshole", "assholes", "arsehole", "arse", "assmunch", "dumbass", "jackass", "fatass",
    "bitch", "bitches", "bitchy", "biatch", "btch", "b1tch",
    "damn", "dammit", "goddamn", "goddammit",
    "dick", "dicks", "dickhead", "dickheads", "d1ck",
    "cock", "cocks", "cocksucker", "cocksucking", "c0ck",
    "cunt", "cunts",
    "bastard", "bastards",
    "whore", "whores",
    "slut", "sluts", "slutty",
    "piss", "pissed", "pissing",
    "crap", "crappy",

    // ── English: Sexual / vulgar ──
    "blowjob", "handjob", "rimjob", "footjob",
    "dildo", "vibrator",
    "boner", "erection",
    "cum", "cumming", "cumshot", "jizz", "spunk", "splooge",
    "boob", "boobs", "tits", "titties", "titty",
    "penis", "vagina", "clitoris", "clit", "genitals",
    "porn", "porno", "pornography", "xxx", "nsfw",
    "pussy", "pussies",
    "wank", "wanker", "wanking",
    "hentai", "milf",
    "orgasm", "orgy", "threesome", "gangbang",
    "anal", "anus", "rectum", "butthole",
    "hooker", "prostitute",

    // ── English: Racial slurs + hate ──
    "nigger", "niggers", "nigga", "niggas", "n1gga", "negro", "nig",
    "chink", "chinks",
    "spic", "spics",
    "kike", "kikes",
    "wetback",
    "beaner", "beaners",
    "towelhead", "raghead",
    "coon", "coons",
    "honkey",
    "cracker",
    "white power", "swastika", "neonazi",

    // ── English: Disability / Other slurs ──
    "retard", "retarded", "retards",
    "spastic",
    "tranny",

    // ── English: Abbreviations ──
    "stfu", "gtfo", "kys",
    "motherfucker", "motherfucking", "mf", "mofo",
    "fag", "fags", "faggot", "faggots",
    "twat", "twats", "tosser",

    // ── Malay: Core profanity ──
    "bodoh", "bodo", "bdoh",
    "babi", "b4bi", "bbs",
    "sial", "sialan",
    "celaka",
    "pukimak", "puki", "pukima", "kimak", "kmk",
    "lancau", "lanchau", "lanciau",
    "buto", "butoh", "butuh",
    "sundal", "sondol",
    "haram", "haramjadah", "haram jadah",
    "bangsat",
    "anjing", "anj1ng", "anjg", "ajg",
    "setan", "syaitan",
    "gila",
    "bangang",
    "palat", "pantat", "pantik",
    "tetek", "konek", "konekt", "kote",
    "jamban", "taik", "tai", "najis",
    "keparat", "bedebah",
    "mampus", "mampos",
    "cipap", "cipab",
    "lahanat",
    "monyet",
    "bajingan",
    "burit",
    "pelacur",
    "jalang",
    "barua",
    "tolol", "tololt",
    "dungu",
    "busuk",
    "hampeh", "hampas",
    "tahi", "tahik",
    "pepek",
    "jubur",
    "isap", "hisap",

    // ── Malay: Compound insults (common phrases) ──
    "mak kau", "bapak kau", "pak kau",
    "kepala bapak", "kepala hotak",
    "palo buto",
    "anak haram",
    "diamlah",
];

// Build regex patterns with word boundaries (compiled once)
const BAD_WORD_PATTERNS = BAD_WORDS.map(
    (word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
);

export function containsBadWords(text: string): boolean {
    if (!text) return false;
    // Normalize: replace common letter substitutions
    const normalized = text
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/@/g, "a")
        .replace(/\$/g, "s");
    return BAD_WORD_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Ban an IP address for a duration (default 24 hours).
 */
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function banIp(ip: string, durationMs: number = BAN_DURATION_MS): void {
    banStore.set(ip, Date.now() + durationMs);
}

/**
 * Check if an IP is currently banned.
 */
export function isIpBanned(ip: string): { banned: boolean; remainingMs: number } {
    const unbanAt = banStore.get(ip);
    if (!unbanAt) return { banned: false, remainingMs: 0 };
    const remaining = unbanAt - Date.now();
    if (remaining <= 0) {
        banStore.delete(ip);
        return { banned: false, remainingMs: 0 };
    }
    return { banned: true, remainingMs: remaining };
}
