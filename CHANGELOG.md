# CHANGELOG — Pathfinder Border Intelligence

All notable changes to this project will be documented in this file.

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
