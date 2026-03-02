# lessons-learned.md - Border Tracker

## 📚 Session Lessons

### [2026-01-12] Framework Initialization
- **Lesson**: Proper initialization of ALESA v7.16.5 ensures ownership auto-fix is active.
- **Severity**: Medium
- **Context**: Starting a new session or framework migration.
- **Fix**: Run the INIT protocol (chown/chmod) to prevent 403 Forbidden errors.

### [2026-01-12] Executable Permissions in node_modules
- **Lesson**: ALESA standard file permission fix (644) removes executable bits from binaries in `node_modules/.bin`.
- **Severity**: High
- **Context**: Running `npm run start` or any binary from `node_modules`.
- **Fix**: Run `chmod +x node_modules/.bin/*` after applying the 644 permission fix.

---

### [2026-02-25] ALESA Framework Upgraded: v7.16.5 → v14.0.0 Sentinel Mode
- **Action**: Full framework upgrade. README.md replaced. QUICK-REFERENCE.md updated.
- **Backup**: `README.md.bak.*.PRE_UPGRADE` preserved.
- **Context**: Sentinel Mode adds 12-point safety checklist, risk matrix, session lifecycle.

### [2026-02-25] Codebase Khatam — Key Findings
- **CRITICAL 🔴**: `LoginPortal.tsx` has hardcoded credentials (`admin` / `admin123`) — MUST fix before any public use.
- **MEDIUM 🟡**: `ChatSystem.tsx` is stateless client-side only. Chat API (`/api/chat`) exists and uses Prisma but is NOT wired to UI.
- **MEDIUM 🟡**: `QueueMap.tsx` uses **static hardcoded** border coordinates and statuses — not connected to live scraper data.
- **MEDIUM 🟡**: AdminDashboard analytics (1,242 users, 5.8k views) are hardcoded — not real data.
- **MEDIUM 🟡**: PM2 process `border` has **68 restarts** — investigate `pm2 logs border` for crashes.
- **LOW 🟢**: `tokens.json` file for FCM tokens — Prisma `FcmToken` model exists but not used (dual storage system).
- **INFO**: `notification-service.ts` sends auto-alerts when queue > 30 min. Firebase Admin reads `firebase-admin.json`.
- **INFO**: `CurrencyWidget` fetches from `open.er-api.com` with fallback rate 3.425 BND/MYR.

*Add new lessons below this line*

---

### [2026-02-26] borderkiu.com Scraper Replaced → TomTom Traffic Flow API
- **Action**: Removed illegal HTML scraping from `borderkiu.com`. Replaced with official TomTom Traffic Flow API.
- **Key insight**: borderkiu.com themselves use TomTom data. We now use it directly.
- **API**: `GET /traffic/services/4/flowSegmentData/absolute/{zoom}/json?point={lat},{lon}&key={key}`
- **Congestion model**: `jamFactor = 1 - (currentSpeed / freeFlowSpeed)` → estimated queue minutes
- **Free tier**: 2,500 req/day — 8 req/refresh × 288 refreshes/day = 2,304 req (safe within limit)
- **API key**: Stored in `.env` as `TOMTOM_API_KEY` (server-side only, not exposed to client)

### [2026-02-26] Admin Panel Fully Removed — Security Risk Eliminated
- **CRITICAL fix**: `LoginPortal.tsx` had hardcoded credentials `admin/admin123` visible in browser DevTools.
- **Action**: Removed admin nav tab, `LoginPortal` and `AdminDashboard` imports from `page.tsx`.
- **Lesson**: Never hardcode credentials in client-side code. Any user can see it via DevTools.

### [2026-02-26] iOS PWA — 6 Bugs Fixed
- **manifest.json**: theme_color was `#9333ea` (purple) — changed to app bg `#060d1a`.
- **Icons**: Were external CDN URLs (broken offline). Replaced with self-hosted PNG icons.
- **apple-touch-icon**: Was missing entirely. Added `apple-touch-icon.png` 180×180.
- **maximumScale**: Was set to 1, blocking pinch-zoom. Removed for accessibility.
- **PWAAwareness position**: Was overlapping bottom nav. Fixed with `calc(72px + safe-area-inset-bottom)`.
- **Lucide icons**: `PWAAwareness.tsx` was still using Lucide. Replaced with Phosphor.

### [2026-02-26] OLED Dark Background — Eye Strain Fix
- **Before**: `#0c1f3f` (bright electric navy) — too harsh, caused eye strain.
- **After**: `#060d1a` (deep near-black blue) — cinematic, OLED-friendly, glassmorphism floats better.
- **Lesson**: When using glassmorphism, background must be near-black. Glass cards need contrast to shine.

### [2026-02-27] Telegram Bot Integration — @borderbrunei Channel
- **Action**: Implemented Telegram Bot API for automatic border jam alerts.
- **Bot**: `@Intelligentborderbot` → Channel: `@borderbrunei`
- **Cooldown**: 15-min cooldown per border to prevent spam (same border won't re-alert within 15 min).
- **Trigger**: Auto-fires when any border exceeds 45 min queue (same threshold as FCM push).
- **API**: `POST /api/telegram/broadcast` — supports `test`, `summary`, and custom `message`.
- **Key insight**: Telegram Bot API is free + unlimited, vs WhatsApp/Twilio (paid per message).
- **Env vars**: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL_ID` in `.env` (chmod 600).

---

### [2026-03-02] wttr.in Unreachable from VPS → Switched to Open-Meteo
- **Problem**: wttr.in API timed out from Hostinger VPS (works locally but not on server).
- **Solution**: Switched to Open-Meteo API — free, no API key, reliable, same data format.
- **Lesson**: Always have fallback weather service. wttr.in is great for CLI but unreliable for server-to-server calls.

### [2026-03-02] Theme Flicker on PWA Reopen — Hydration Mismatch
- **Problem**: When user sets light mode, closes PWA, reopens → page renders dark (server default), then flashes to light when Settings tab mounts ThemeToggle.
- **Root cause**: `<html className="dark">` hardcoded in `layout.tsx`. ThemeToggle only reads localStorage on mount.
- **Fix**: Added blocking inline `<script>` in `<head>` that reads localStorage and applies theme class BEFORE React hydrates. Added `suppressHydrationWarning` to `<html>`.
- **Lesson**: For SSR apps with localStorage-based themes, always use a blocking script to avoid FOUC (Flash of Unstyled Content).

### [2026-03-02] GPS Coordinates Must Be Verified at Source
- **Problem**: Border coordinates for Kuala Lurah, Ujung Jalan, and Mengkalap were inaccurate, causing TomTom API to return traffic data for wrong road segments.
- **Fix**: User provided verified coordinates from Google Maps. Updated across 6 files.
- **Lesson**: GPS coordinates are foundational — wrong coords mean wrong data everywhere (heatmap, weather, cron, map). Always verify with user or on-the-ground data.

### [2026-03-02] Android PWA Location Denied — Poor Default UX
- **Problem**: Android Chrome in PWA mode blocks geolocation with no obvious way for user to re-enable it.
- **Fix**: Added platform-specific step-by-step instructions (Android: Chrome Site Settings, iOS: Safari Location) + Try Again retry button.
- **Lesson**: Location denied states need actionable guidance, not just "access denied" text.

