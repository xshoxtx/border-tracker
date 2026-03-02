import { writeFile, readdir, unlink, stat, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "snaps");
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Border coordinates for GPS validation (server-side) ───
const BORDER_COORDS: Record<string, { lat: number; lng: number }> = {
    "Sungai Tujuh": { lat: 4.5852, lng: 114.0723 },
    "Kuala Lurah": { lat: 4.7407, lng: 114.8135 },
    "Ujung Jalan": { lat: 4.6181, lng: 115.2464 },
    "Mengkalap": { lat: 4.5600, lng: 115.4000 },
};

/**
 * Haversine distance (km)
 */
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Check if a GPS position is within maxDistKm of any known border.
 * Returns the nearest border name and distance, or null if none within range.
 */
export function findNearestBorder(
    lat: number,
    lng: number,
    maxDistKm: number = 0.5
): { border: string; distance: number } | null {
    let nearest: { border: string; distance: number } | null = null;
    for (const [name, coords] of Object.entries(BORDER_COORDS)) {
        const dist = getDistanceKm(lat, lng, coords.lat, coords.lng);
        if (!nearest || dist < nearest.distance) {
            nearest = { border: name, distance: dist };
        }
    }
    if (nearest && nearest.distance <= maxDistKm) {
        return nearest;
    }
    return null;
}

/**
 * Ensure the upload directory exists
 */
async function ensureUploadDir() {
    try {
        await stat(UPLOAD_DIR);
    } catch {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
}

/**
 * Save an uploaded image buffer to disk.
 * Returns the public URL path (e.g. "/uploads/snaps/1709345678-abc123.jpg")
 */
export async function saveImage(buffer: Buffer, originalName: string): Promise<string> {
    await ensureUploadDir();
    const ext = path.extname(originalName).toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);
    return `/uploads/snaps/${filename}`;
}

/**
 * Clean up snap images older than 24 hours.
 * Called periodically from the API route.
 */
export async function cleanOldSnaps(): Promise<number> {
    await ensureUploadDir();
    const files = await readdir(UPLOAD_DIR);
    let cleaned = 0;
    const now = Date.now();

    for (const file of files) {
        try {
            const filepath = path.join(UPLOAD_DIR, file);
            const fileStat = await stat(filepath);
            if (now - fileStat.mtimeMs > MAX_AGE_MS) {
                await unlink(filepath);
                cleaned++;
            }
        } catch {
            // skip files that can't be read
        }
    }
    return cleaned;
}
