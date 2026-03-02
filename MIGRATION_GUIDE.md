# 🚀 Border Tracker - Migration Guide untuk cPanel
> Prepared by ALESA Framework | 2026-01-07

---

## 📋 Pre-Migration Checklist

- [ ] cPanel dengan **Node.js Selector** (pastikan support Node.js 18+)
- [ ] Domain/subdomain sudah setup
- [ ] SSH access (recommended) atau Terminal dalam cPanel
- [ ] MySQL/MariaDB (jika nak database nanti)

---

## 📦 Files Yang Perlu Transfer

### Core Files (WAJIB)
```
├── src/                    # Source code
├── public/                 # Static files (images, manifest, etc.)
├── package.json            # Dependencies
├── package-lock.json       # Lock file
├── next.config.ts          # Next.js config
├── tsconfig.json           # TypeScript config
├── postcss.config.mjs      # PostCSS config
├── tailwind.config.ts      # Tailwind (kalau ada)
└── eslint.config.mjs       # ESLint config
```

### JANGAN Transfer
```
├── node_modules/           ❌ (install fresh kat server baru)
├── .next/                  ❌ (build fresh kat server baru)
├── backups/                ❌ (optional, besar sangat)
└── .git/                   ❌ (optional)
```

---

## 🔧 Setup Steps di cPanel

### Step 1: Upload Files
1. Login cPanel → **File Manager**
2. Navigate ke `public_html/domain-baru/` 
3. Upload `migration.zip` dan extract

### Step 2: Setup Node.js App
1. cPanel → **Setup Node.js App**
2. Click **CREATE APPLICATION**
3. Settings:
   - **Node.js version**: `18` atau lebih tinggi
   - **Application mode**: `Production`
   - **Application root**: `/home/username/public_html/domain-baru`
   - **Application URL**: Pilih domain/subdomain
   - **Application startup file**: `node_modules/.bin/next` 
   - **Passenger log file**: (default)

4. Click **CREATE**

### Step 3: Install Dependencies
1. Dalam Node.js App interface, click **Run NPM Install**
   
   ATAU via SSH/Terminal:
   ```bash
   cd ~/public_html/domain-baru
   npm install
   ```

### Step 4: Build Application
Via SSH/Terminal:
```bash
cd ~/public_html/domain-baru
npm run build
```

### Step 5: Start Application
1. Balik ke **Setup Node.js App**
2. Click **RESTART** pada app border-tracker

---

## ⚠️ Troubleshooting

### Error: "npm run build" fails
```bash
# Check Node version
node -v  # Mesti 18+

# Clear cache dan reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Error: Site shows 503
1. Check Node.js App dalam cPanel - pastikan status **Running**
2. Check Application log untuk errors
3. Pastikan port tidak conflict

### Error: API tidak jalan
- Pastikan `/api/border` route accessible
- Check kalau ada CORS issues

---

## 🔐 Environment Variables (Optional)

Kalau nak tambah env variables:
1. cPanel → **Setup Node.js App**
2. Scroll ke **Environment variables**
3. Add:
   - `NODE_ENV` = `production`
   - (tambah yang lain kalau perlu)

---

## ✅ Post-Migration Checklist

- [ ] Website accessible via domain baru
- [ ] Queue data loading properly
- [ ] Map rendering correctly
- [ ] Currency widget working
- [ ] Chat system functional
- [ ] Admin login working (admin/admin123)
- [ ] PWA installable
- [ ] Dark/Light mode toggle working

---

## 📞 Quick Commands Reference

```bash
# SSH ke server
ssh username@server-ip

# Navigate ke folder
cd ~/public_html/domain-baru

# Install dependencies
npm install

# Build production
npm run build

# Restart via cPanel atau
touch tmp/restart.txt
```

---

*Powered by ALESA Framework v7.15.0*
