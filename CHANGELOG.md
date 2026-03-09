# CHANGELOG — BorderIQ (formerly Pathfinder Border Intelligence)

All notable changes to this project will be documented in this file.

---

## [v3.5.0] — 2026-03-09

### Added
- **🗺️ Live Traffic Map** — New Map tab in bottom navigation with TomTom Traffic Flow tile overlay. Roads colour-coded green/yellow/red based on real-time congestion relative to free-flow speed
- **Traffic ON/OFF toggle** — Gradient button to show/hide traffic layer
- **Colour legend** — Bottom-left overlay showing green = free flow, yellow = moderate, red = congested
- **Theme-aware map tiles** — Dark mode uses CARTO Dark All, light mode uses CARTO Light All. Auto-switches via MutationObserver on `data-theme` attribute

### Changed
- **🧠 Rebrand → BorderIQ** — Renamed from "Pathfinder Border Intelligence" to "BorderIQ — Smart Border Intelligence" across 9 files (manifest, layout, page, settings, share card, telegram, PWA prompt, CSS). Zero Pathfinder references remaining

### Fixed
- **🌓 iOS PWA Theme Persistence (Round 2)** — Added `pageshow` + `visibilitychange` listeners to blocking script for bfcache restore
- **📅 Public Holiday Dates** — 11 dates corrected, 3 added (Thaipusam, Start of Ramadan, Wesak Day), Aug 31 label fixed to "Merdeka Day"
- **📍 TomTom Directional Coordinates** — Zoom 10→15, coordinates spread 1-2km apart, all verified on Google Maps
- **🏷️ Tedungan → Kuala Lurah** — Renamed across 9 files
- **Light mode map tiles** — Fixed CARTO Voyager URL to `light_all`

#### Modified
- `src/components/QueueMap.tsx` — Complete rewrite: traffic tiles, toggle, legend, theme-aware base map
- `src/app/page.tsx` — Re-added Map tab (TabId, navItem, dynamic import with `ssr: false`)
- `.env` — Added `NEXT_PUBLIC_TOMTOM_API_KEY`
- `src/app/layout.tsx` — `pageshow` + `visibilitychange` listeners
- `src/app/api/border/route.ts` — Zoom 15, user-verified coordinates, Kuala Lurah labels
- `src/app/api/smart-alert/route.ts` — Kuala Lurah coordinates + labels
- `src/app/api/cron/collect/route.ts` — Kuala Lurah coordinates + labels
- `src/app/api/crossing/route.ts` — Kuala Lurah in whitelist
- `src/components/QueueHeatmap.tsx`, `QueueMap.tsx`, `CrossingReport.tsx`, `BorderCard.tsx` — Kuala Lurah labels
- `src/components/HolidayAlert.tsx` — Corrected 2026 holiday dates

---

## [v3.4.2] — 2026-03-08

### Added
- **📊 Google Analytics 4** — GA4 property `G-53KPQLQ6E9` integrated via `next/script` with `strategy="afterInteractive"` (does not block page render / Core Web Vitals)
  - CSP updated in `next.config.ts` to whitelist `googletagmanager.com`, `google-analytics.com`, `analytics.google.com`, `region1.google-analytics.com`

### Fixed
- **⭐ BorderCard Star Alignment** — Moved favorite star button from left column header row into right column (stacked with Share + Navigate icons). Fixes visual disconnect caused by `flex-1` pushing star to misaligned position

### Security
- **🔐 API Security Hardening** — Full security audit performed on all 14 API endpoints. Critical vulnerabilities patched:
  - `/api/notifications/broadcast` + `/api/telegram/broadcast` — Now require `Authorization: Bearer <INTERNAL_API_SECRET>` (previously fully open — anyone could spam FCM push or Telegram channel)
  - `/api/chat` — IP rate limit: 5 messages/minute + HTML sanitization + 500 char limit
  - `/api/crossing` — IP rate limit: 3 submissions/10min + border name whitelist + 300 char note max
  - `/api/snaps` — Dual rate limit: IP-based (1/15min) + existing nickname-based layer
  - `/api/snaps/flag` — Per-snapId per-IP rate limit (prevents single user mass-hiding content) + global 10 flags/hour cap
  - `/api/incidents` — IP + nickname dual rate limit; PATCH dismiss also rate limited (5/hour)
- **🛡️ New shared lib** — `src/lib/rateLimit.ts`: in-memory rate limiter with `checkRateLimit()`, `getClientIp()` (Cloudflare/Nginx/proxy aware), `sanitize()`, `checkInternalAuth()`

#### Modified
- `src/app/layout.tsx` — Added GA4 Script tags
- `next.config.ts` — CSP updated for GA4 domains
- `src/components/BorderCard.tsx` — Star button moved to right column
- `src/app/api/notifications/broadcast/route.ts` — Auth added
- `src/app/api/telegram/broadcast/route.ts` — Auth added
- `src/app/api/chat/route.ts` — Rate limit + sanitize
- `src/app/api/crossing/route.ts` — Rate limit + whitelist + sanitize
- `src/app/api/snaps/route.ts` — IP rate limit added
- `src/app/api/snaps/flag/route.ts` — Per-snap + global rate limit
- `src/app/api/incidents/route.ts` — IP + nickname rate limit; PATCH rate limited
- `src/lib/rateLimit.ts` — **[NEW]** Shared security utilities

---

## [v3.4.1] — 2026-03-08


### Fixed
- **🌓 iOS PWA Theme Persistence** — Light mode now correctly persists after PWA close/reopen on iOS
  - Root cause: 3-layer bug (className overwrite, regex edge case, ThemeToggle only mounting on Settings tab open)
  - Solution: Switched theme system from CSS class (`.dark`) to `data-theme` attribute (`[data-theme="dark"]`)
  - Blocking script now uses `setAttribute('data-theme', t)` — immune to React hydration className conflicts
  - `ThemeToggle` now reads theme from DOM on init (already set by blocking script) instead of defaulting to `"dark"`
  - `ThemeToggle` uses `setAttribute` instead of `className =` — no longer overwrites font variable class
  - Added `storage` event listener in `ThemeToggle` for cross-tab theme sync

#### Modified
- `src/app/layout.tsx` — Fixed blocking script + `data-theme="dark"` default on `<html>`
- `src/components/ThemeToggle.tsx` — DOM-first init, `setAttribute`, storage listener
- `src/app/globals.css` — All `.dark { }` → `[data-theme="dark"] { }`

---

## [v3.4.0] — 2026-03-03

### Phase 9: User Favorites + Crossing Timer ✅

#### Added
- **⭐ User Favorites** — Star icon on each `BorderCard`, tap to favorite. Favorited borders appear first in Home tab with "Your Favorites" section header. Saved in localStorage, persists across sessions
- **⏱️ Crossing Timer** (`CrossingTimer.tsx`) — Stopwatch-style timer to track actual wait time at border. Border picker, start/stop/save/reset controls, localStorage persistence (timer survives page close), auto-post to `/api/crossing` on save

#### Modified
- `src/components/BorderCard.tsx` — Added `Star` icon (Phosphor), `isFavorite` + `onFavoriteToggle` props, brand orange `#ff824c` filled star with scale animation
- `src/app/page.tsx` — Favorites state from localStorage, "Your Favorites" section rendering, `CrossingTimer` positioned below `NearestBorder`

---

## [v3.3.1] — 2026-03-03

### Added
- **📍 Lokasi (Location Permission) Setting** — New section in Settings with live permission status (🟢 Dibenarkan / 🟡 Belum / 🔴 Disekat), one-tap Enable button, and platform-specific step-by-step instructions (Android Chrome/PWA, iOS Safari, Desktop) in Bahasa Melayu

### Modified
- `src/components/SettingsPage.tsx` — Added Location section with `navigator.permissions.query` auto-detect + `onchange` listener for real-time status updates

---

## [v3.3.0] — 2026-03-02

### Phase 8: Smart Intelligence ✅

#### Added
- **📊 QueueHistory DB** — Prisma model for hourly traffic snapshots (indexed by dayOfWeek + hour)
- **⏰ Cron Collector** (`/api/cron/collect`) — Hourly data collection for all 8 border directions, 90-day auto-cleanup
- **🔥 Queue Heatmap** (`/api/heatmap` + `QueueHeatmap.tsx`) — 7×24 color-coded grid, best/worst indicators, border picker
- **🗺️ Google Maps Navigate** — One-tap driving directions from `BorderCard` and `NearestBorder`
- **🌤️ Border Weather** (`/api/weather` + `BorderWeather.tsx`) — Open-Meteo API (free, no key), temp/rain/humidity/wind/visibility
- **📅 Holiday Queue Predictor** — Severity-based estimates (extreme/high/moderate/low), dynamic advice tips
- **🔔 Smart Departure Alert** (`/api/smart-alert`) — FCM push when any queue ≤10 min, auto-chained to cron

#### Fixed
- **🌓 Theme flicker on PWA reopen** — Blocking inline script applies saved theme before React hydration
- **💬 Chat close button** — "✕ Close Chat" switches back to Feed sub-tab
- **📍 Android location denied UX** — Platform-specific step-by-step instructions + Try Again button
- **📌 GPS coordinates** — Fixed Kuala Lurah, Ujung Jalan, Mengkalap to user-verified values across 6 files

#### New Files
- `src/app/api/weather/route.ts` — Open-Meteo weather API
- `src/app/api/smart-alert/route.ts` — FCM push when queue is clear
- `src/app/api/cron/collect/route.ts` — Hourly TomTom data collector
- `src/app/api/heatmap/route.ts` — 7×24 grid aggregation API
- `src/components/BorderWeather.tsx` — Weather widget
- `src/components/QueueHeatmap.tsx` — Visual heatmap grid

#### Modified
- `prisma/schema.prisma` — Added `QueueHistory` model
- `src/app/layout.tsx` — Theme hydration fix (blocking script + suppressHydrationWarning)
- `src/app/page.tsx` — Integrated Weather + Heatmap, chat close button
- `src/components/HolidayAlert.tsx` — Severity-based queue predictions
- `src/components/BorderCard.tsx` — Navigate button + ShareCard
- `src/components/NearestBorder.tsx` — Navigate button + Android location UX
- `public/icon-*.png` — New PWA icon (location pin + road)

---

## [v3.2.0] — 2026-03-02

### Phase 7: Community & Viral ✅

#### Added
- **📸 Queue Camera Snap** — Camera-only photo uploads with GPS auto-detect, 15-min rate limit, community flagging (3 flags = auto-hide), 24h auto-purge
- **🔗 Share Card** — Canvas-generated Instagram-story images (1080×1920px) with border status, Web Share API + download fallback
- **🏆 Leaderboard** — Top 10 weekly contributors with badge tiers (Bronze/Silver/Gold/Diamond), aggregates snaps + chats + incident reports
- **🚨 Incident Reports** — Structured reporting (System Down, Extra Counters, Road Closure, Other) with active incident banners + auto-post to community chat

#### New Files
- `src/lib/upload.ts` — Server-side image storage + GPS validation + auto-cleanup
- `src/app/api/snaps/route.ts` — Queue snap GET + POST with file validation
- `src/app/api/snaps/flag/route.ts` — Community flagging endpoint
- `src/app/api/incidents/route.ts` — Incident report CRUD
- `src/app/api/leaderboard/route.ts` — Contribution aggregation API
- `src/components/QueueSnap.tsx` — Camera snap + live photo feed
- `src/components/ShareCard.tsx` — Canvas image generator
- `src/components/Leaderboard.tsx` — Ranked contributor list
- `src/components/IncidentReport.tsx` — Incident form + active banners

#### Modified
- `prisma/schema.prisma` — Added `QueueSnap` + `IncidentReport` models
- `src/components/BorderCard.tsx` — Added ShareCard button
- `src/app/page.tsx` — Restructured Community tab (Incidents → Snaps → CrossingReport → Leaderboard → Chat)
- `src/app/globals.css` — Added incident banner styles

---

## [v3.1.0] — 2026-02-27

### Phase 6: Advanced Features ✅

#### Added
- **🔔 Personal Alert Threshold** — Slider in Settings (5-60 min) saved to localStorage
- **🗺️ Live Map Integration** — QueueMap with CircleMarkers, color-coded status, per-direction popups
- **📢 Telegram Jam Bot** — `@Intelligentborderbot` broadcasts to `@borderbrunei` channel
- **🌐 Public API** — `GET /api/v1/borders` with CORS for developers
- **💾 CrossingReport persistence** — Prisma `CrossingReport` model + `/api/crossing` API
- **💬 ChatSystem wiring** — Connected to `/api/chat` Prisma endpoint with 10s auto-poll
- **Map tab** — 4-tab bottom navigation (Home / Map / Chat / Settings)

#### Fixed
- **🛡️ CSP for map tiles** — Added `*.basemaps.cartocdn.com` to Content-Security-Policy via `.htaccess`
- Removed duplicate CSP headers (Apache + Next.js conflict)

#### Tech
- Added `next.config.ts` security headers (CSP, connect-src for TomTom/Telegram/FCM)
- Prisma schema: `CrossingReport` model
- Lazy-loaded QueueMap to prevent SSR issues with Leaflet

---

## [v3.0.0] — 2026-02-25

### Phase 5: Competitive Features ✅

#### Added
- StatusBanner (Jam Panic + Status Overview)
- BestTimeWidget (6 time slots + weekly pattern)
- CrossingReport ("I Just Crossed" form)
- HolidayAlert (21 BN/MY holidays 2026)
- NearestBorder (geolocation-based)
- BorderCard (new design with status pill)
- SettingsPage (push toggle, privacy, cache clear)
- /miri travel guide page

---

## [v2.0.0] — 2026-02-22

### Phase 4: PWA iOS Fix ✅
- Fixed manifest.json for iOS PWA
- Added apple-touch-icon, iOS meta tags
- Removed TravelDropdown

---

## [v1.0.0] — 2026-02-20

### Phase 2-3: Native Redesign + Data Source ✅
- Full design system rebuild (OLED dark #060d1a)
- Airbnb Cereal font, Phosphor Icons
- Glassmorphism cards with spring animations
- TomTom Traffic Flow API (replaced borderkiu.com)
- Removed admin panel (security risk)
