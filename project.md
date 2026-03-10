# project.md — BorderIQ (formerly Pathfinder Border Intelligence)
**Last Updated**: 2026-03-10 | **Version**: v3.5.1 | **ALESA**: v14.3.0 Sentinel Mode

---

## 🎯 Project Identity
| Key | Value |
|---|---|
| **App Name** | Pathfinder Border Intelligence |
| **Domain** | `border.creativepresslab.com` |
| **Port** | 4000 (PM2: `border`) |
| **Stack** | Next.js 16, React 19, Tailwind v4, Prisma/MySQL, Firebase FCM |
| **Design** | Airbnb Cereal font, Phosphor Icons, #337cfd / #ff824c / #060d1a |
| **Data Source** | TomTom Traffic Flow API (key in `.env` → `TOMTOM_API_KEY`) |
| **Analytics** | Google Analytics 4 → `G-53KPQLQ6E9` (via `next/script` afterInteractive) |
| **Security** | `INTERNAL_API_SECRET` in `.env` — required for broadcast endpoints |

---

## ✅ Completed — Phase 2: Native App Redesign
- [x] ALESA v14.0.0 Sentinel Mode activated
- [x] Full design system rebuild (globals.css) — OLED dark background `#060d1a`
- [x] Airbnb Cereal font via `next/font/local` (6 weights)
- [x] Phosphor Icons across all components
- [x] Bottom navigation bar (Home / Community / Settings)
- [x] Glassmorphism cards with native spring animations
- [x] All components redesigned: QueueCard, ChatSystem, CurrencyWidget, OfficialLinks, ThemeToggle

## ✅ Completed — Phase 3: Data & Security
- [x] **borderkiu.com REMOVED** → replaced with TomTom Traffic Flow API (official, legal)
- [x] TomTom API key stored in `.env` (server-side only)
- [x] Admin panel + LoginPortal **removed completely** (hardcoded creds security risk)
- [x] Border API returns: currentSpeed, freeFlowSpeed, confidence, estimated queue minutes

## ✅ Completed — Phase 4: PWA iOS Fix
- [x] `manifest.json` — fixed theme_color, local icons (no CDN), maskable, lang
- [x] `layout.tsx` — apple-touch-icon, iOS meta tags, viewport-fit=cover, removed maximumScale
- [x] `PWAAwareness.tsx` — Phosphor icons, positioned above bottom nav, sessionStorage dismiss
- [x] PWA icons generated: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- [x] TravelDropdown removed from header + component deleted

## ✅ Completed — Phase 5: Competitive Features
- [x] **🚨 StatusBanner** (`StatusBanner.tsx`) — Jam Panic + Status Overview (🟢 Clear / 🟡 Moderate / 🔴 Jammed count, live data)
- [x] **⏰ BestTimeWidget** (`BestTimeWidget.tsx`) — 6 time slots + weekly traffic pattern + current-time highlight
- [x] **👋 CrossingReport** (`CrossingReport.tsx`) — "I Just Crossed" form (border picker, wait time, notes, localStorage history)
- [x] **🗓️ HolidayAlert** (`HolidayAlert.tsx`) — 21 BN/MY public holidays 2026, 14-day lookahead, urgency color-coding
- [x] **📍 NearestBorder** (`NearestBorder.tsx`) — Geolocation-based distance + drive time (Haversine, 25km/h avg)
- [x] **🪝 useGeolocation** (`hooks/useGeolocation.ts`) — Custom hook: permission flow, BORDER_COORDS, distance calc
- [x] **🃏 BorderCard** (`BorderCard.tsx`) — New clean card with status pill, queue time, skeleton loader
- [x] **⚙️ SettingsPage** (`SettingsPage.tsx`) — Push toggle, dark mode, PDP/GDPR, cache clear, share, about v3.0.0
- [x] **🏖️ /miri page** (`app/miri/page.tsx`) — Miri travel guide (5 attractions + 4 food spots, Google Maps links)

---

## ✅ Phase 6: Advanced Features (COMPLETED 2026-02-27)

### Completed
| # | Feature | Status |
|---|---|---|
| 1 | **🔔 Personal Alert Threshold** | ✅ Slider in SettingsPage (5-60 min, localStorage) |
| 2 | **📊 Live Map Integration** | ✅ QueueMap with live CircleMarkers + Map tab |
| 3 | **💾 CrossingReport → API** | ✅ Prisma `CrossingReport` model + `/api/crossing` endpoint |
| 4 | **💬 ChatSystem → API** | ✅ Wired to `/api/chat` Prisma + 10s auto-poll |
| 5 | **📢 Telegram Jam Bot** | ✅ `@Intelligentborderbot` → `@borderbrunei` channel |
| 6 | **🌐 Public API** | ✅ `GET /api/v1/borders` with CORS headers |

### Tech Debt
- [x] Wire `ChatSystem.tsx` to `/api/chat` Prisma endpoint — ✅ DONE
- [ ] Replace `tokens.json` FCM storage with Prisma `FcmToken` model (currently dual storage)

---

## ✅ Completed — Phase 7: Community & Viral
| # | Feature | Status |
|---|---|---|
| 1 | **📸 Queue Camera Snap** | ✅ Camera upload, GPS lock, rate limit, community flag, 24h purge |
| 2 | **🔗 Share Card** | ✅ Canvas-generated 1080×1920 image, Web Share API |
| 3 | **🏆 Leaderboard / Karma** | ✅ Weekly top 10, badge tiers (Bronze→Diamond), aggregated contributions |
| 4 | **🚨 Incident Reports** | ✅ System Down / Extra Counters / Road Closure / Other, active banners |

---

## ✅ Phase 8: Smart Intelligence (COMPLETED 2026-03-02)
| # | Feature | Status |
|---|---|---|
| 1 | **📊 QueueHistory + Cron Collector** | ✅ Hourly TomTom snapshots, 90-day cleanup |
| 2 | **🔥 Queue Heatmap** | ✅ 7×24 color-coded grid + border picker |
| 3 | **🗺️ Google Maps Navigate** | ✅ One-tap directions from BorderCard + NearestBorder |
| 4 | **🌤️ Border Weather** | ✅ Open-Meteo API — temp, rain, wind, humidity |
| 5 | **📅 Holiday Queue Predictor** | ✅ Severity-based estimates (extreme→low) |
| 6 | **🔔 Smart Departure Alert** | ✅ FCM push when queue ≤10 min, chained to cron |
| 7 | **📌 GPS Coordinate Fixes** | ✅ All 4 borders verified by user |
| 8 | **🌓 Theme Flicker Fix** | ✅ Blocking script for theme hydration |
| 9 | **💬 Chat Close Button** | ✅ Close button switches to Feed |
| 10 | **📍 Android Location UX** | ✅ Platform-specific instructions + retry |
| 11 | **🎨 PWA Icon Redesign** | ✅ New location pin + road icon |
| 12 | **📍 Lokasi Permission Setting** | ✅ Settings section — live status, enable button, platform instructions (BM) |

---

## ✅ Phase 9: Analytics & Polish (IN PROGRESS 2026-03-08)
| # | Feature | Status |
|---|---|---|
| 1 | **⭐ User Favorites** | ✅ Star icon on BorderCard, favorites-first rendering, localStorage |
| 2 | **⏱️ Crossing Timer** | ✅ Stopwatch with border picker, localStorage persistence, save to API |
| 3 | **📊 Google Analytics 4** | ✅ GA4 `G-53KPQLQ6E9` via `next/script` afterInteractive, CSP updated |
| 4 | **⭐ BorderCard Star Fix** | ✅ Star moved to right column — stacked with Share + Navigate buttons |
| 5 | **🔐 Security Hardening** | ✅ Full audit, 7 endpoints patched, shared `rateLimit.ts` lib created |
| 6 | **📅 Holiday Date Fix** | ✅ 11 dates corrected, 3 holidays added, sources cited |
| 7 | **📍 TomTom Coordinate Fix** | ✅ Zoom 10→15, coordinates verified on Google Maps, directional data working |
| 8 | **🏷️ Tedungan → Kuala Lurah** | ✅ Renamed across 9 files |
| 9 | **🗺️ Live Traffic Map** | ✅ TomTom Flow tile overlay, toggle, legend, theme-aware (dark/light) |
| 10 | **🧠 Rebrand → BorderIQ** | ✅ Renamed across 9 files, zero Pathfinder refs remaining |
| 11 | **📍 Nearest Border Coord Fix** | ✅ BORDER_COORDS updated to verified Brunei-side CIQ approach coordinates |
| 12 | **🌐 Community Text → English** | ✅ Translated all BM strings in QueueSnap, IncidentReport, Leaderboard |
| 13 | **🛡️ Bad Words Filter + Ban** | ✅ ~180 terms (EN+BM), leet-speak normalization, 24h IP ban on violation |
| 14 | **📊 Weekly Jam Report** | ⬜ Planned |
| 15 | **🌐 Multi-language** | ⬜ Planned |

---

## 🔑 Key File Locations
```
src/app/
  page.tsx            — Main app shell (Home/Community/Settings tabs)
  globals.css         — Full design system tokens
  layout.tsx          — iOS PWA meta, font, viewport
  miri/page.tsx       — Miri travel guide page
  api/border/         — TomTom Traffic Flow API route
  api/chat/           — Prisma chat endpoint
  api/currency/       — Currency exchange rate API
  api/notifications/  — FCM broadcast

src/components/
  StatusBanner.tsx     — Jam panic + status overview (clear/moderate/jammed)
  BorderCard.tsx       — Per-direction border status card
  NearestBorder.tsx    — Geolocation-based nearest border finder
  BestTimeWidget.tsx   — Best time to cross (time slots + weekly pattern)
  HolidayAlert.tsx     — Upcoming holiday predictor (BN/MY)
  CrossingReport.tsx   — "I Just Crossed" community reports
  ChatSystem.tsx       — Community chat
  CurrencyWidget.tsx   — BND/MYR live exchange rate
  SettingsPage.tsx     — App settings & privacy
  PWAAwareness.tsx     — iOS install prompt
  CrossingTimer.tsx    — Border crossing stopwatch
  ThemeToggle.tsx      — Dark/Light toggle

src/hooks/
  useGeolocation.ts    — Geolocation hook + border coords + distance utils

public/
  manifest.json        — PWA manifest
  icon-192.png         — PWA icon
  icon-512.png         — PWA icon (maskable)
  apple-touch-icon.png — iOS home screen icon
  fonts/               — Airbnb Cereal OTF (6 weights)

src/app/api/
  weather/             — Border weather (Open-Meteo)
  smart-alert/         — FCM push when queue clear [🔐 CRON_SECRET]
  cron/collect/        — Hourly TomTom data collector [🔐 CRON_SECRET]
  heatmap/             — 7×24 grid aggregation
  notifications/broadcast/ — FCM mass push [🔐 INTERNAL_API_SECRET required]
  telegram/broadcast/  — Telegram channel post [🔐 INTERNAL_API_SECRET required]

src/lib/
  rateLimit.ts         — Shared IP rate limiter, sanitize, auth, bad words filter, IP ban system
```

---

## 🏗️ Architecture Notes
- **Data refresh**: Auto every 5 min via `setInterval` in `page.tsx`
- **Congestion model**: `jamFactor = 1 - (currentSpeed/freeFlowSpeed)` → estimate queue minutes
- **Threshold alert**: `sendThresholdAlert()` fires FCM push if queue > 45 min
- **Theme system**: `data-theme` attribute on `<html>` (not CSS class) — immune to Next.js hydration conflicts
- **Security model**: Broadcast endpoints require `Authorization: Bearer <INTERNAL_API_SECRET>`; write endpoints IP-rate-limited via `src/lib/rateLimit.ts`; text inputs sanitized (HTML stripped, length capped)
- **Content moderation**: Chat messages filtered by `containsBadWords()` (~180 terms EN+BM, leet-speak normalization); violations trigger 24h IP ban via `banIp()` (in-memory, resets on server restart)
- **Free tier**: TomTom 2,500 req/day; 8 req/refresh × 288 refreshes/day = 2,304 req ✅
