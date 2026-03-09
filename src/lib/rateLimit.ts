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

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
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
