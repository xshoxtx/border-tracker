# lessons-learned.md - BorderIQ (formerly Border Tracker)

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

---

### [2026-03-03] Location Toggle — App-Level vs Browser-Level Permissions
- **Insight**: Two separate layers of control needed: (1) **App toggle** in Settings (localStorage `location_enabled`) controls whether the app even attempts to use location, (2) **Browser permission** (`navigator.permissions.query`) is the OS-level gate.
- **Pattern**: Toggle OFF → `NearestBorder` returns null, no geolocation calls. Toggle ON → triggers `getCurrentPosition()` which prompts browser if needed.
- **Lesson**: When building privacy-sensitive features, give users BOTH app-level and browser-level control. The app toggle is faster/friendlier than navigating to browser settings.

### [2026-03-03] PWA Install Banner — iOS Only
- **Problem**: Custom PWA install banner was showing on Android, competing with Chrome's native `beforeinstallprompt` banner.
- **Fix**: `PWAAwareness.tsx` now only renders for iOS users. Android Chrome handles install prompt automatically.
- **Lesson**: Don't duplicate native browser functionality. Android Chrome's built-in install prompt is superior to custom banners.

### [2026-03-03] Permissions-Policy Header for PWA Geolocation
- **Problem**: PWA standalone mode on some Android devices silently blocks geolocation even when site has granted permission.
- **Fix**: Added `Permissions-Policy: geolocation=(self)` in both `next.config.ts` (for Next.js responses) and `.htaccess` (for Apache initial load).
- **Lesson**: PWAs running in standalone mode may need explicit Permissions-Policy headers. Setting headers in both the app framework AND the web server ensures coverage for all request paths.

### [2026-03-03] User Favorites — localStorage + Parent-Controlled State
- **Pattern**: Favorites stored as JSON array in localStorage (`favorite_borders`). Parent component (`page.tsx`) owns state, passes `isFavorite` + `onFavoriteToggle` as props to `BorderCard`.
- **Key decision**: Favorites section appears ABOVE regular border groups (only in "All" filter mode), giving instant value without disrupting existing layout.
- **Lesson**: For simple user preferences (no auth needed), localStorage + React state is simpler and faster than a database-backed solution.

### [2026-03-03] Crossing Timer — Persistent Stopwatch Pattern
- **Challenge**: Timer must survive page close, tab switch, and app restart in PWA.
- **Solution**: Store `{ border, startTime, running, elapsed }` in localStorage. On reload, if `running=true`, recalculate elapsed from `Date.now() - startTime` — no drift.
- **Pattern**: Use absolute `startTime` (epoch ms) instead of relative elapsed— this makes timer persistence trivial and accurate across restarts.
- **Lesson**: For persistent timers, always store the START time, not the elapsed time. Elapsed can be derived from start time on reload.

### [2026-03-03] GitHub PAT Token Expiry
- **Problem**: `gh auth` token expired, causing `git push` to fail with "Invalid username or token."
- **Fix**: Generated new Personal Access Token (PAT) and re-authenticated via `gh auth login --with-token`.
- **Lesson**: PAT tokens have expiry dates. Check `gh auth status` first before attempting push. Current token expires Apr 1, 2026.

---

### [2026-03-08] iOS PWA Theme Persistence — 3-Layer Bug Fixed
- **Problem**: Set light mode → close PWA → reopen → shows dark. Click Settings → go back Home → shows light.
- **Root causes (3 bugs)**:
  1. `ThemeToggle` used `document.documentElement.className = saved` — **overwrote** the Next.js font variable class (`__variable-abc123`), corrupting hydration
  2. Blocking script regex produced `" light"` (leading space) when `dark` wasn't in the existing class string
  3. `ThemeToggle` only mounted when Settings tab opened → DOM correction only happened after user visited Settings
- **Fix**: Switched theme system from CSS class to `data-theme` HTML attribute:
  - `layout.tsx` blocking script → `setAttribute('data-theme', t)` instead of className regex
  - `ThemeToggle` → reads `document.documentElement.getAttribute('data-theme')` on init (already set by blocking script), uses `setAttribute` on toggle
  - `globals.css` → all `.dark { }` → `[data-theme="dark"] { }`
- **Lesson**: For iOS PWA theme persistence, **never use `className =`** — it overwrites other classes. Use `dataset` or `setAttribute`. The theme toggle component should read from the DOM (set by blocking script), not default to `"dark"` — this is the class of bug that only manifests on iOS PWA where React hydration conflicts with bfcache page restoration.

---

### [2026-03-08] API Security — Broadcast Endpoints Must Always Be Auth-Protected
- **Problem**: `/api/notifications/broadcast` and `/api/telegram/broadcast` had no authentication. Anyone who discovered the endpoint could spam Firebase push notifications to ALL users or post fake messages to the Telegram channel.
- **Fix**: Added `Authorization: Bearer <INTERNAL_API_SECRET>` check using `checkInternalAuth()`. Secret stored in `.env` as `INTERNAL_API_SECRET`.
- **Lesson**: **Any endpoint that sends mass communications (push, email, Telegram, SMS) must ALWAYS be protected by a secret.** Even if the endpoint is "private", assumption of internal-only access is not security. Treat all HTTP endpoints as publicly reachable.

---

### [2026-03-08] Rate Limiting by Nickname is Insufficient — Always Use IP
- **Problem**: `/api/snaps` and `/api/incidents` rate limited by `nickname` only. Attacker can bypass by simply changing their nickname on each request — no server-side verification of identity.
- **Fix**: Added dual layer — IP-based rate limit (primary) + nickname (secondary). IP extracted from `cf-connecting-ip` / `x-real-ip` / `x-forwarded-for` headers to work behind proxies.
- **Lesson**: **Nickname/username-based rate limits are easily bypassed.** The only reliable server-side identity signal without auth is IP. Combine IP rate limiting with any existing user-identity checks for belt-and-suspenders protection.

---

### [2026-03-08] Next.js Script Component for Third-Party Analytics
- **Best practice**: Use `<Script strategy="afterInteractive">` from `next/script` for analytics (GA4, Hotjar, etc.) — not raw `<script>` in `_document` or `layout.tsx` `<head>`. `afterInteractive` loads the script after hydration, preserving Core Web Vitals (LCP, FID, CLS) scores.
- **CSP requirement**: When adding any external script, its domain(s) must be whitelisteed in `script-src`, `connect-src`, and (if it loads images) `img-src` in your Content-Security-Policy headers.
- **GA4 domains needed**: `googletagmanager.com` (script), `google-analytics.com` + `analytics.google.com` + `region1.google-analytics.com` (data collection endpoints).

---

### [2026-03-09] iOS PWA bfcache Restoration — Blocking Scripts Don't Re-Run
- **Problem**: Fixed the theme system to use `data-theme` attribute (v3.4.1), but light mode STILL reverted to dark on iOS PWA close/reopen.
- **Root cause**: iOS restores PWA from **bfcache** (frozen DOM snapshot) — the blocking `<script>` in `<head>` does **NOT re-execute** on bfcache restore. The `<html>` tag reverts to SSR default `data-theme="dark"`.
- **Fix**: Added `pageshow` (with `event.persisted` check) and `visibilitychange` event listeners inside the blocking script. These fire on bfcache restore and app switch, re-applying the saved theme.
- **Lesson**: **Blocking scripts only run once on initial page load.** For iOS PWA, always add `pageshow` + `visibilitychange` listeners if state must persist across app close/reopen cycles. The blocking script pattern alone is insufficient.

---

### [2026-03-09] TomTom Flow API — Zoom Level Determines Segment Granularity
- **Problem**: Both directions of a border crossing showed identical queue times (e.g., Brunei→Miri = Miri→Brunei = 26 min).
- **Root cause**: Coordinates were ~200m apart and zoom was set to 10. At zoom 10, road segments span 5-10km — both coordinates snapped to the **exact same segment**, returning identical data.
- **Fix**: Increased zoom from 10 to 15 (segments ~200-500m). Spread directional coordinates 1-2km apart on each country's approach road so they land on genuinely different road segments.
- **Lesson**: **TomTom Flow Segment API zoom level directly controls segment size.** For directional traffic data, use zoom ≥14 and place coordinates on separate approach roads, not at the same junction.

---

### [2026-03-09] Leaflet + Next.js — SSR Kills, Dynamic Import Saves
- **Problem**: Adding `import QueueMap from "@/components/QueueMap"` directly in `page.tsx` caused build failure — Leaflet accesses `window` and `document` which don't exist during SSR.
- **Fix**: Use `next/dynamic` with `ssr: false`: `const QueueMap = dynamic(() => import("@/components/QueueMap"), { ssr: false })`. This ensures Leaflet only loads client-side.
- **React-leaflet gotcha**: `MapContainer` is immutable after creation — can't change `center`, `zoom`, or tile URLs dynamically. To swap tile layers (e.g., dark↔light), use a `key` prop so React unmounts and remounts the `TileLayer` component.
- **CARTO base map URLs**: Dark = `dark_all`, Light = `light_all`. The `voyager` style needs `rastertiles/voyager` prefix — using just `voyager` returns blank tiles.

---

### [2026-03-10] Coordinate Accuracy Matters for Distance Calculations
- **Problem**: Users in Kuala Belait (Brunei) saw inflated distances to Sungai Tujuh border. The `BORDER_COORDS` longitude was `114.0723` — which placed it on the **Malaysia side** of the border.
- **Root cause**: Original coordinates were approximate. The Haversine formula amplifies even small coordinate errors — a 2km placement error translates to a noticeably wrong distance for nearby users.
- **Fix**: Updated to verified Brunei-side CIQ approach coordinates (`114.0900`) matching the border API route coordinates confirmed during Phase 8.
- **Lesson**: **When coordinates are used for user-facing distance calculations, always verify the exact side of the border/boundary they represent.** Cross-reference with the coordinates used in other parts of the app (e.g., API routes) to ensure consistency.

---

### [2026-03-10] Content Moderation — IP Ban, Not Nickname Ban
- **Problem**: Community chat needed profanity filtering. Users can change nicknames freely, so nickname-based banning is trivially bypassed.
- **Solution**: Three-layer system: (1) `containsBadWords()` checks message AND nickname, (2) `banIp()` bans the IP for 24h on first violation, (3) `isIpBanned()` rejects ALL subsequent requests from that IP regardless of nickname.
- **Leet-speak bypass prevention**: Normalize common substitutions (`0→o`, `1→i`, `3→e`, `4→a`, `@→a`, `$→s`) before matching.
- **Word-boundary matching**: Each term compiled as `/\bword\b/i` regex to prevent false positives (e.g., "assessment" doesn't trigger "ass").
- **Trade-off**: In-memory ban store resets on server restart (PM2 restart clears all bans). Acceptable for this use case — persistent bans would require database storage.
- **Lesson**: **For anonymous/low-trust systems, always use IP-based enforcement as the primary layer.** Nickname/user-identity checks are unreliable without authentication. Leet-speak normalization is essential — users WILL try `f@ck`, `sh1t`, `b0d0h` etc.

---

### [2026-03-12] Apache `.htaccess` CSP Overrides Next.js — GA4 Blocked
- **Problem**: GA4 (`G-53KPQLQ6E9`) was implemented in `layout.tsx` and whitelisted in `next.config.ts` CSP — but GA dashboard showed "No data received".
- **Root cause**: Apache proxy serves TWO `Content-Security-Policy` headers (one from `.htaccess`, one from Next.js). Browsers enforce the **most restrictive** of all CSP headers. The old `.htaccess` CSP had no `googletagmanager.com` entries — blocked the GA script even though `next.config.ts` allowed it.
- **Fix**: Updated `.htaccess` to match `next.config.ts` — added GA4 domains to `script-src`, `img-src`, and `connect-src`.
- **Lesson**: **When running Next.js behind Apache proxy, treat `.htaccess` as the primary CSP gate.** Both files send CSP headers and the browser enforces BOTH. Any time you add a new external domain to `next.config.ts`, ALWAYS update `.htaccess` simultaneously. Consider keeping CSP in only ONE place to avoid drift.

---

### [2026-03-17] React Hydration Overwrites Blocking Script Theme — ThemeProvider Fix
- **Problem (3rd occurrence)**: Light mode reverts to dark on PWA reopen (iOS + Android). The blocking `<script>` in `<head>` correctly sets `data-theme="light"`, BUT React hydration reconciles the `<html>` element back to `data-theme="dark"` (the server-rendered default).
- **Why previous fixes were incomplete**: `suppressHydrationWarning` only mutes the console warning — it does NOT prevent React from re-applying server-rendered attributes. `pageshow` listener only fires on bfcache restore (`e.persisted=true`), not cold starts. `visibilitychange` only fires on tab/app switch.
- **Fix**: Created `ThemeProvider.tsx` — a zero-UI client component (`useEffect` only, returns null) that re-applies the saved theme from `localStorage` immediately after React hydration completes. Mounted in `layout.tsx` alongside `NotificationRegister`.
- **Why this works**: `useEffect` fires AFTER hydration, so it runs after React has already overwritten the attribute. It's the last write to `data-theme`, so it wins.
- **Lesson**: **Blocking scripts prevent FOUC but cannot survive React hydration.** For SSR apps with client-side theme state, you need BOTH: (1) blocking script for visual flash prevention, AND (2) a client component `useEffect` to re-apply after hydration. The blocking script alone is necessary but not sufficient.
