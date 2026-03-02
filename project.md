# project.md — Pathfinder Border Intelligence
**Last Updated**: 2026-03-02 | **Version**: v3.2.0 | **ALESA**: v14.3.0 Sentinel Mode

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

## 📋 Phase 8: Smart Intelligence
| # | Feature | Description |
|---|---|---|
| 1 | **🔔 Smart Departure Alert** | "Leave at 7:30am to arrive when queue < 15 min" — TomTom + historical patterns + driving distance |
| 2 | **📅 Predicted Wait by Day** | "Mon avg 25 min, Fri avg 45 min" — built from historical TomTom + crossing report data |
| 3 | **🌤️ Border Weather** | Show weather at each crossing (OpenWeatherMap free tier) — rain = expect delays |
| 4 | **📈 7-Day Jam Heatmap** | Chart using TomTom Traffic Stats API historical data |

---

## 📋 Phase 9: Analytics & Polish
| # | Feature | Description |
|---|---|---|
| 1 | **📊 Weekly Jam Report** | Auto-generated PDF/image summary every Sunday → Telegram channel. People love weekly stats |
| 2 | **🗺️ Live Heatmap Layer** | Leaflet heatmap overlay (traffic density coloured) on Map tab |
| 3 | **🌙 Dark/Light Mode Toggle** | Full theme switch with localStorage persistence |
| 4 | **📱 Widget Support** | iOS/Android home screen widget showing current wait times |

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
  PWAAwareness.tsx     — iOS/Android install prompt
  ThemeToggle.tsx      — Dark/Light toggle

src/hooks/
  useGeolocation.ts    — Geolocation hook + border coords + distance utils

public/
  manifest.json        — PWA manifest
  icon-192.png         — PWA icon
  icon-512.png         — PWA icon (maskable)
  apple-touch-icon.png — iOS home screen icon
  fonts/               — Airbnb Cereal OTF (6 weights)
```

---

## 🏗️ Architecture Notes
- **Data refresh**: Auto every 5 min via `setInterval` in `page.tsx`
- **Congestion model**: `jamFactor = 1 - (currentSpeed/freeFlowSpeed)` → estimate queue minutes
- **Threshold alert**: `sendThresholdAlert()` fires FCM push if queue > 45 min
- **Free tier**: TomTom 2,500 req/day; 8 req/refresh × 288 refreshes/day = 2,304 req ✅
