# QUICK-REFERENCE.md - Border Tracker
# ALESA Framework v14.0.0 Sentinel Mode

## 🚀 Project
- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Port**: 4000 (PM2 process: `border`)
- **DB**: MySQL via Prisma (`FcmToken`, `ChatMessage`)
- **Notifications**: Firebase FCM (client + admin SDK)
- **Maps**: Leaflet (SSR disabled, `dynamic()` import)

## 🛡️ ALESA Protocols (v14.0.0)
1. `INIT` — Load framework + lessons + status check
2. **BACKUP** → `cp file file.bak.$(date +%Y%m%d_%H%M%S).PRE_EDIT` before ANY edit
3. **READ** → Always read file before modifying
4. **OWNERSHIP** → `chown creativ7:creativ7` after create; `chmod +x node_modules/.bin/*` after npm ops
5. `TUTUP SESI` — End session, backup, lessons update

## 🛠️ Common Commands
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Start on port 4000
pm2 restart border   # Restart PM2 process
pm2 logs border      # Check crash logs (68 restarts!)
```

## ⚠️ Known Issues (Technical Debt)
1. 🔴 **CRITICAL**: `LoginPortal.tsx` hardcoded credentials (admin/admin123)
2. 🟡 ChatSystem not wired to DB API (stateless client)
3. 🟡 QueueMap uses static/hardcoded coords — not live data
4. 🟡 AdminDashboard analytics are hardcoded
5. 🟡 PM2: 68 restarts — check `pm2 logs border`
6. 🟢 `tokens.json` should migrate to Prisma `FcmToken` table

## 📁 Key File Locations
- `/src/app/page.tsx` — Main page, 5-min polling loop
- `/src/app/api/border/route.ts` — Scraper (borderkiu.com, regex)
- `/src/components/LoginPortal.tsx` — ⚠️ SECURITY FIX NEEDED
- `/src/lib/firebase.ts` — FCM client config
- `/src/data/tokens.json` — FCM token registry
- `prisma/schema.prisma` — DB schema
