# STANDARDS.md - Universal Development Checklist
## Mobile-First Native Feel Edition

```
═══════════════════════════════════════════════════════════════
ALESA DEVELOPMENT STANDARDS v2.0
Companion to ALESA Framework v7.13.0 - GENERAL EDITION
═══════════════════════════════════════════════════════════════
VERSION: 2.0
RELEASE DATE: 2025-12-14
PURPOSE: Development standards & patterns for ALL projects
SCOPE: Stack requirements, UI patterns, code standards
APPLIES TO: All current and future ALESA projects

NOTE: This file defines WHAT to build.
      ALESA Framework defines HOW to behave safely.
═══════════════════════════════════════════════════════════════
```

---

# 🎯 BAHAGIAN A: NEXT.JS STACK (PRIMARY - Future Projects)

## I. Complete Tech Stack - PRIORITIZED

```
╔═══════════════════════════════════════════════════════════════╗
║  ALESA COMPLETE DEV STACK v2.0                                ║
║  Prioritized: 🔴 CRITICAL → 🟠 HIGH → 🟡 MEDIUM → 🟢 OPTIONAL ║
╚═══════════════════════════════════════════════════════════════╝
```

### 🔴 PRIORITY 1: CORE FOUNDATION (WAJIB)

```
┌─────────────────────────────────────────────────────────────┐
│  FRAMEWORK & CORE                                           │
├─────────────────────────────────────────────────────────────┤
│  Framework    : Next.js 16 (App Router)                    │
│  UI Library   : React 19                                    │
│  Language     : TypeScript (strict mode)                   │
│  Database     : MariaDB                                     │
│  ORM          : Prisma                                      │
│  Process Mgmt : PM2                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STYLING & UI                                               │
├─────────────────────────────────────────────────────────────┤
│  CSS          : Tailwind CSS                               │
│  Components   : shadcn/ui (PRIMARY)                        │
│  Primitives   : Radix UI                                   │
│  Themes       : Radix Themes                               │
│  Utilities    : clsx + tailwind-merge (cn function)        │
└─────────────────────────────────────────────────────────────┘
```

### 🔴 PRIORITY 2: STATE & DATA (CRITICAL)

```
┌─────────────────────────────────────────────────────────────┐
│  STATE MANAGEMENT - The Power Combo                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Zustand           : Client state (simple, lightweight)    │
│  → Install: npm i zustand                                  │
│  → Use for: UI state, user preferences, cart, modals       │
│                                                             │
│  TanStack Query    : Server state (caching, sync)          │
│  → Install: npm i @tanstack/react-query                    │
│  → Use for: API calls, data fetching, mutations            │
│                                                             │
│  WHY THIS COMBO:                                           │
│  → Zustand = what user does (local)                        │
│  → TanStack = what server has (remote)                     │
│  → Together = complete state solution                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔴 PRIORITY 3: FORMS & VALIDATION (CRITICAL)

```
┌─────────────────────────────────────────────────────────────┐
│  FORM HANDLING - Type-Safe & Performant                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React Hook Form   : Form state & submission               │
│  → Install: npm i react-hook-form                          │
│  → Use for: All forms, minimal re-renders                  │
│                                                             │
│  Zod               : Schema validation                     │
│  → Install: npm i zod                                      │
│  → Use for: Form validation, API validation, type inference│
│                                                             │
│  @hookform/resolvers : Bridge RHF + Zod                    │
│  → Install: npm i @hookform/resolvers                      │
│                                                             │
│  PATTERN:                                                  │
│  → Define Zod schema                                       │
│  → Infer TypeScript type from schema                       │
│  → Use with React Hook Form                                │
│  → Same schema for client + server validation              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🟠 PRIORITY 4: UI ESSENTIALS (HIGH)

```
┌─────────────────────────────────────────────────────────────┐
│  ICONS - Pick ONE primary, others as backup                │
├─────────────────────────────────────────────────────────────┤
│  Lucide            : PRIMARY (shadcn default)              │
│  → Install: npm i lucide-react                             │
│                                                             │
│  Heroicons         : Alternative style                     │
│  → Install: npm i @heroicons/react                         │
│                                                             │
│  Material Symbols  : Google style (bila perlu)             │
│  → Install: npm i @material-symbols/font-400               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TOAST/NOTIFICATIONS                                        │
├─────────────────────────────────────────────────────────────┤
│  Sonner            : PRIMARY (best for shadcn)             │
│  → Install: npm i sonner                                   │
│  → Beautiful, accessible, customizable                     │
│  → Already styled for shadcn ecosystem                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ANIMATION                                                  │
├─────────────────────────────────────────────────────────────┤
│  Framer Motion     : Complex animations                    │
│  → Install: npm i framer-motion                            │
│  → Use for: Page transitions, gestures, complex motion     │
│                                                             │
│  Tailwind Animate  : Simple animations                     │
│  → Install: npm i tailwindcss-animate                      │
│  → Use for: Hover effects, simple transitions              │
└─────────────────────────────────────────────────────────────┘
```

### 🟠 PRIORITY 5: FONTS (HIGH)

```
┌─────────────────────────────────────────────────────────────┐
│  TYPOGRAPHY - Modern Sans Serif Stack                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIMARY (pick one):                                       │
│  → Inter          : Clean, versatile, excellent readability│
│  → Geist          : Vercel's font, modern tech feel        │
│                                                             │
│  ALTERNATIVES:                                             │
│  → Mona Sans      : GitHub's font, friendly               │
│  → IBM Plex Sans  : Professional, IBM design              │
│  → Manrope        : Geometric, modern                     │
│                                                             │
│  MONOSPACE (for code):                                     │
│  → Geist Mono     : Pairs with Geist                      │
│  → JetBrains Mono : Developer favorite                    │
│  → IBM Plex Mono  : Pairs with IBM Plex Sans              │
│                                                             │
│  SETUP (next/font):                                        │
│  import { Inter } from 'next/font/google'                  │
│  const inter = Inter({ subsets: ['latin'] })               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🟡 PRIORITY 6: UTILITIES (MEDIUM)

```
┌─────────────────────────────────────────────────────────────┐
│  DATE & TIME                                                │
├─────────────────────────────────────────────────────────────┤
│  date-fns          : Lightweight, tree-shakeable           │
│  → Install: npm i date-fns                                 │
│  → Use for: Format, parse, manipulate dates                │
│                                                             │
│  dayjs             : Alternative (moment.js replacement)   │
│  → Install: npm i dayjs                                    │
│  → Smaller bundle, similar API to moment                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  UTILITIES                                                  │
├─────────────────────────────────────────────────────────────┤
│  clsx              : Conditional classnames                │
│  → Install: npm i clsx                                     │
│                                                             │
│  tailwind-merge    : Merge Tailwind classes safely         │
│  → Install: npm i tailwind-merge                           │
│                                                             │
│  CN FUNCTION (combine both):                               │
│  // lib/utils.ts                                           │
│  import { clsx, type ClassValue } from "clsx"              │
│  import { twMerge } from "tailwind-merge"                  │
│  export function cn(...inputs: ClassValue[]) {             │
│    return twMerge(clsx(inputs))                            │
│  }                                                         │
└─────────────────────────────────────────────────────────────┘
```

### 🟡 PRIORITY 7: AUTHENTICATION (MEDIUM)

```
┌─────────────────────────────────────────────────────────────┐
│  AUTH OPTIONS                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NextAuth.js / Auth.js : Self-hosted, flexible             │
│  → Install: npm i next-auth                                │
│  → Pros: Full control, many providers, free                │
│  → Use when: Custom auth flow needed                       │
│                                                             │
│  Clerk              : Hosted, fast setup                   │
│  → Install: npm i @clerk/nextjs                            │
│  → Pros: Beautiful UI, quick setup, managed                │
│  → Use when: Speed to market, don't want to manage auth    │
│                                                             │
│  Lucia Auth         : Lightweight, flexible                │
│  → Install: npm i lucia                                    │
│  → Pros: Simple, type-safe, no magic                       │
│  → Use when: Want full control, understand auth well       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🟢 PRIORITY 8: DATA VISUALIZATION (OPTIONAL)

```
┌─────────────────────────────────────────────────────────────┐
│  CHARTS & GRAPHS (bila perlu dashboard/analytics)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Recharts          : React-based, composable               │
│  → Install: npm i recharts                                 │
│  → Best for: Custom charts, flexibility                    │
│                                                             │
│  Tremor            : Built on Tailwind, dashboard-ready    │
│  → Install: npm i @tremor/react                            │
│  → Best for: Quick dashboards, consistent style            │
│                                                             │
│  Chart.js          : Classic, well-documented              │
│  → Install: npm i react-chartjs-2 chart.js                 │
│  → Best for: Simple charts, familiar API                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🟢 PRIORITY 9: EXTRAS (OPTIONAL)

```
┌─────────────────────────────────────────────────────────────┐
│  FILE UPLOAD                                                │
├─────────────────────────────────────────────────────────────┤
│  uploadthing       : Easy file uploads for Next.js         │
│  → Install: npm i uploadthing @uploadthing/react           │
│                                                             │
│  react-dropzone    : Drag & drop file input                │
│  → Install: npm i react-dropzone                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  RICH TEXT EDITOR                                           │
├─────────────────────────────────────────────────────────────┤
│  Tiptap            : Headless, customizable                │
│  → Install: npm i @tiptap/react @tiptap/starter-kit        │
│                                                             │
│  Plate             : Built on Slate, plugin system         │
│  → Install: npm i @udecode/plate                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TABLES                                                     │
├─────────────────────────────────────────────────────────────┤
│  TanStack Table    : Headless, powerful                    │
│  → Install: npm i @tanstack/react-table                    │
│  → Best for: Complex tables, sorting, filtering            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EMAIL                                                      │
├─────────────────────────────────────────────────────────────┤
│  React Email       : Build emails with React               │
│  → Install: npm i react-email @react-email/components      │
│                                                             │
│  Resend            : Send emails (pairs with React Email)  │
│  → Install: npm i resend                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## II. Quick Install Commands

### Minimum Setup (PRIORITY 1-3)
```bash
# Core UI
npm i clsx tailwind-merge
npx shadcn@latest init

# State Management
npm i zustand @tanstack/react-query

# Forms & Validation
npm i react-hook-form zod @hookform/resolvers

# Icons & Toast
npm i lucide-react sonner

# Animation
npm i framer-motion tailwindcss-animate
```

### Full Setup (All Priorities)
```bash
# Everything above PLUS:

# Date handling
npm i date-fns

# Auth (pick one)
npm i next-auth
# OR
npm i @clerk/nextjs

# Charts (if needed)
npm i recharts
# OR
npm i @tremor/react
```

---

## III. TypeScript Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## IV. Project Structure
```
/src
├── /app              → App Router pages & layouts
├── /components       → Reusable UI components
│   ├── /ui           → shadcn/ui components
│   └── /features     → Feature-specific components
├── /lib              → Utilities, configs, helpers
│   ├── utils.ts      → cn function, helpers
│   ├── validations.ts→ Zod schemas
│   └── api.ts        → API helpers
├── /hooks            → Custom React hooks
├── /stores           → Zustand stores
├── /types            → TypeScript definitions
├── /styles           → Global styles (if needed)
└── /server           → Server actions & API logic
```

## V. Environment Variables
```bash
# .env.local (NEVER commit)
DATABASE_URL="mysql://user:pass@localhost:3306/db"
NEXTAUTH_SECRET="xxx"
# ... other secrets

# Validate on startup - add to next.config.js or lib/env.ts
```

---

# 📱 BAHAGIAN B: MOBILE-FIRST NATIVE FEEL (CRITICAL)

## II. Mobile-First Design Principles

```
┌─────────────────────────────────────────────────────────────┐
│  DESIGN APPROACH: MOBILE → TABLET → DESKTOP                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Start dari: 320px (smallest mobile)                       │
│  Scale up:   sm: → md: → lg: → xl: → 2xl:                 │
│                                                             │
│  Tailwind breakpoints:                                      │
│  - Default   = Mobile (no prefix)                          │
│  - sm:640px  = Large phones                                │
│  - md:768px  = Tablets                                     │
│  - lg:1024px = Laptops                                     │
│  - xl:1280px = Desktops                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## III. Native Mobile UI Patterns (WAJIB)

### Touch & Interaction Standards

```
MINIMUM TOUCH TARGET: 44x44px

Touch Feedback Classes:
- active:scale-95        → Button press effect
- active:scale-[0.98]    → Subtle press effect
- active:opacity-70      → Opacity feedback
- transition-all duration-150 ease-out → Smooth animations
```

### System Font Stack (Native Feel)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Tailwind class */
className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]"
```

### Safe Area Handling (Notch/Home Indicator)
```tsx
// For bottom navigation/fixed elements
className="pb-[env(safe-area-inset-bottom)]"

// Full height accounting for dynamic viewport
className="min-h-[100dvh]"
```

---

## IV. Native Component Templates

### Primary Button
```tsx
<button
  className="
    w-full py-4 px-6
    bg-blue-600 text-white font-semibold
    rounded-xl
    active:scale-[0.98] active:bg-blue-700
    transition-all duration-150 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[44px]
  "
>
  Button Text
</button>
```

### Secondary Button
```tsx
<button
  className="
    w-full py-4 px-6
    bg-gray-100 text-gray-900 font-semibold
    rounded-xl border border-gray-200
    active:scale-[0.98] active:bg-gray-200
    transition-all duration-150 ease-out
    min-h-[44px]
  "
>
  Secondary
</button>
```

### Input Field (No iOS Zoom)
```tsx
<input
  type="text"
  className="
    w-full py-4 px-4
    text-[16px]              /* CRITICAL: Prevents iOS zoom */
    bg-gray-100
    border-0 rounded-xl
    outline-none
    focus:ring-2 focus:ring-blue-500 focus:bg-white
    transition-all duration-200
    placeholder:text-gray-400
  "
  placeholder="Enter text..."
/>
```

### Textarea
```tsx
<textarea
  className="
    w-full py-4 px-4
    text-[16px]
    bg-gray-100
    border-0 rounded-xl
    outline-none resize-none
    focus:ring-2 focus:ring-blue-500 focus:bg-white
    transition-all duration-200
    placeholder:text-gray-400
    min-h-[120px]
  "
  placeholder="Enter message..."
/>
```

### Card Component
```tsx
<div
  className="
    bg-white rounded-2xl p-4
    shadow-sm border border-gray-100
    active:scale-[0.99]
    transition-transform duration-150
  "
>
  {/* Card content */}
</div>
```

### Interactive Card (Clickable)
```tsx
<button
  className="
    w-full text-left
    bg-white rounded-2xl p-4
    shadow-sm border border-gray-100
    active:scale-[0.98] active:bg-gray-50
    transition-all duration-150
  "
>
  {/* Card content */}
</button>
```

### Bottom Navigation
```tsx
<nav
  className="
    fixed inset-x-0 bottom-0
    bg-white/90 backdrop-blur-lg
    border-t border-gray-200
    pb-[env(safe-area-inset-bottom)]
  "
>
  <div className="flex justify-around items-center h-16">
    {/* Nav items - each min 44x44px touch target */}
    <button className="flex flex-col items-center justify-center w-16 h-full">
      <IconHome className="w-6 h-6" />
      <span className="text-xs mt-1">Home</span>
    </button>
    {/* ... more items (max 5) */}
  </div>
</nav>
```

### Sticky Header with Blur
```tsx
<header
  className="
    sticky top-0 z-50
    bg-white/80 backdrop-blur-lg
    border-b border-gray-200
    px-4 py-3
  "
>
  <h1 className="text-xl font-bold">Title</h1>
</header>
```

### Bottom Sheet / Modal
```tsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 z-40" />

{/* Bottom Sheet */}
<div
  className="
    fixed inset-x-0 bottom-0 z-50
    bg-white rounded-t-3xl
    shadow-2xl
    pb-[env(safe-area-inset-bottom)]
    animate-slide-up
  "
>
  {/* Drag Handle */}
  <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

  {/* Content */}
  <div className="px-4 pb-4">
    {/* Sheet content */}
  </div>
</div>
```

### Skeleton Loader (Not Spinner)
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

### Toast Notification
```tsx
<div
  className="
    fixed bottom-20 inset-x-4 z-50
    bg-gray-900 text-white
    rounded-xl px-4 py-3
    shadow-lg
    animate-slide-up
  "
>
  <p className="text-sm font-medium">Action completed</p>
</div>
```

---

## V. Animation Classes (Tailwind)

```css
/* Add to globals.css or tailwind.config.js */

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

---

# 🔧 BAHAGIAN C: LARAVEL STACK (Existing Projects)

## VI. Laravel Project Standards

```
┌─────────────────────────────────────────────────────────────┐
│  LARAVEL STACK - EXISTING PROJECTS                         │
├─────────────────────────────────────────────────────────────┤
│  Framework    : Laravel 10/11                              │
│  Frontend     : Blade / Vue / Livewire                     │
│  Database     : MariaDB                                     │
│  Server       : LiteSpeed                                   │
│  Queue        : Redis / Database                           │
│  Cache        : Redis / File                               │
└─────────────────────────────────────────────────────────────┘
```

### Laravel Project Structure (Follow Existing)
```
/app
├── /Http
│   ├── /Controllers    → Keep thin, use Services
│   ├── /Middleware     → Auth, Tenant, etc.
│   └── /Requests       → Form validation
├── /Models             → Eloquent models
├── /Services           → Business logic
├── /Repositories       → Data access (if used)
└── /Observers          → Model events

/resources
├── /views              → Blade templates
├── /js                 → Vue/React components
└── /css                → Styles

/routes
├── web.php             → Web routes
├── api.php             → API routes
└── tenant.php          → Tenant routes (if multi-tenant)
```

### Multi-Tenant Patterns

```
┌─────────────────────────────────────────────────────────────┐
│  MULTI-TENANT DATABASE PATTERN                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Landlord DB: {project}_landlord                           │
│  → Central data (users, tenants, subscriptions)            │
│                                                             │
│  Tenant DBs: {project}_tenant_{id}                         │
│  → Per-tenant data (orders, products, customers)           │
│                                                             │
│  RULES:                                                     │
│  → ALWAYS check tenant context before DB ops               │
│  → NEVER hardcode tenant IDs                               │
│  → Use tenant middleware for auto-switching                │
│  → Backup ALL tenant DBs before migrations                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Laravel API Response Format
```php
// Success response
return response()->json([
    'success' => true,
    'data' => $data,
    'message' => 'Operation successful'
]);

// Error response
return response()->json([
    'success' => false,
    'error' => [
        'code' => 'VALIDATION_ERROR',
        'message' => 'User-friendly message'
    ]
], 422);
```

### Cache Clearing Commands
```bash
# After config change
php artisan config:clear

# After route change
php artisan route:clear

# After view change
php artisan view:clear

# Nuclear option (all caches)
php artisan optimize:clear

# Rebuild optimized files
php artisan optimize
```

### Laravel Security Checklist
```
□ CSRF protection enabled
□ SQL injection protected (use Eloquent/Query Builder)
□ XSS protected (use {{ }} not {!! !!})
□ Mass assignment protected (use $fillable)
□ Authentication middleware on protected routes
□ Rate limiting on API endpoints
□ Validation on all inputs
□ Sensitive data encrypted
```

---

# 🔒 BAHAGIAN D: SECURITY & DATA

## VII. Input Validation

```
┌─────────────────────────────────────────────────────────────┐
│  VALIDATION RULES                                           │
├─────────────────────────────────────────────────────────────┤
│  ✓ SEMUA input validate di SERVER (never trust client)    │
│  ✓ Guna Zod (Next.js) / Laravel Validation (Laravel)      │
│  ✓ Sanitize output untuk prevent XSS                       │
│  ✓ Parameterized queries (Prisma/Eloquent default)        │
└─────────────────────────────────────────────────────────────┘
```

### Zod Schema Example (Next.js)
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().min(18).optional(),
});

// Validate
const result = userSchema.safeParse(input);
if (!result.success) {
  // Handle validation errors
}
```

### Laravel Validation Example
```php
$validated = $request->validate([
    'email' => 'required|email|unique:users',
    'name' => 'required|string|min:2|max:100',
    'age' => 'nullable|integer|min:18',
]);
```

## VIII. API Security Checklist

```
□ CSRF protection for mutations
□ Rate limiting on sensitive endpoints
□ Proper error responses (no sensitive data leak)
□ Authentication on protected routes
□ Input validation before processing
□ Output sanitization
```

---

# ✅ BAHAGIAN E: QUALITY & RELIABILITY

## IX. Error Handling

```typescript
// Next.js - Global Error Boundary
// Create: /src/components/ErrorBoundary.tsx

// API Error Response Format
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "User-friendly message here",
    details: {} // Optional, for debugging
  }
}
```

## X. Health Check Endpoint

### Next.js
```typescript
// /src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
}
```

### Laravel
```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version', '1.0.0')
    ]);
});
```

## XI. PM2 Configuration (Next.js)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'app-name',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

---

# 📦 BAHAGIAN F: OPTIONAL MODULES

## [MODULE: AUTH] Authentication

```
□ NextAuth.js (Next.js) / Laravel Sanctum (Laravel)
□ Session management
□ Protected routes middleware
□ Password reset flow
□ Profile management
```

## [MODULE: SAAS] Multi-Tenancy

```
□ Tenant ID dalam semua queries
□ Middleware validation
□ Database per tenant (Laravel) / Schema per tenant
□ Subscription/billing integration
```

## [MODULE: PWA] Progressive Web App

```
□ Web manifest configured
□ Service worker registered
□ Install prompt handling
□ Push notifications (FCM)
□ Offline fallback
```

## [MODULE: CRON] Scheduled Tasks

```
□ Cron jobs via PM2/OS (Next.js) / Laravel Scheduler
□ Scheduled notifications
□ Automated reports
```

## [MODULE: REALTIME] Live Updates

```
□ WebSocket/SSE setup
□ Real-time data sync
□ Live notifications
□ Presence indicators
```

---

# 📋 QUICK REFERENCE

## Mobile Patterns Cheatsheet

```
┌─────────────────────────────────────────────────────────────┐
│  PATTERN              │  IMPLEMENTATION                     │
├───────────────────────┼─────────────────────────────────────┤
│  Touch target         │  min-h-[44px] min-w-[44px]         │
│  Press feedback       │  active:scale-[0.98]               │
│  Smooth transition    │  transition-all duration-150       │
│  Safe area bottom     │  pb-[env(safe-area-inset-bottom)]  │
│  Full height          │  min-h-[100dvh]                    │
│  Blur header          │  bg-white/80 backdrop-blur-lg      │
│  Native font          │  font-[-apple-system,...]          │
│  No iOS zoom          │  text-[16px] on inputs             │
│  Card style           │  rounded-2xl shadow-sm             │
│  Bottom sheet         │  rounded-t-3xl + drag handle       │
└───────────────────────┴─────────────────────────────────────┘
```

## Pre-Development Checklist

```
□ Stack confirmed (Next.js or Laravel)
□ Mobile-first wireframe ready
□ Database schema drafted
□ Environment variables documented
□ PM2 config prepared (Next.js)
□ Optional modules identified
```

## Pre-Deployment Checklist

```
□ TypeScript no errors (Next.js) / PHPStan clean (Laravel)
□ Mobile responsive tested (320px - 1920px)
□ Touch interactions tested on real device
□ Lighthouse score > 90 (Next.js)
□ Security headers configured
□ Environment variables set
□ Process manager ready (PM2/Supervisor)
□ Health check working
□ Error logging active
```

---

# 📋 COMPLETE STACK CHEATSHEET

```
╔═══════════════════════════════════════════════════════════════╗
║  ALESA COMPLETE DEV STACK - QUICK REFERENCE                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🔴 PRIORITY 1-3 (CRITICAL - Always Install)                 ║
║  ─────────────────────────────────────────────────────────── ║
║  Framework     : Next.js 16, React 19, TypeScript            ║
║  Styling       : Tailwind CSS, shadcn/ui, Radix              ║
║  State         : Zustand (client) + TanStack Query (server)  ║
║  Forms         : React Hook Form + Zod                       ║
║  Database      : Prisma + MariaDB                            ║
║                                                               ║
║  🟠 PRIORITY 4-5 (HIGH - Recommended)                        ║
║  ─────────────────────────────────────────────────────────── ║
║  Icons         : Lucide (primary), Heroicons                 ║
║  Toast         : Sonner                                      ║
║  Animation     : Framer Motion, tailwindcss-animate          ║
║  Fonts         : Inter / Geist (primary)                     ║
║                                                               ║
║  🟡 PRIORITY 6-7 (MEDIUM - As Needed)                        ║
║  ─────────────────────────────────────────────────────────── ║
║  Date          : date-fns / dayjs                            ║
║  Auth          : NextAuth.js / Clerk / Lucia                 ║
║  Utilities     : clsx + tailwind-merge                       ║
║                                                               ║
║  🟢 PRIORITY 8-9 (OPTIONAL - Project Specific)               ║
║  ─────────────────────────────────────────────────────────── ║
║  Charts        : Recharts / Tremor                           ║
║  Tables        : TanStack Table                              ║
║  Editor        : Tiptap / Plate                              ║
║  Upload        : uploadthing / react-dropzone                ║
║  Email         : React Email + Resend                        ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  QUICK INSTALL (Copy & Paste):                               ║
║                                                               ║
║  # Essential (PRIORITY 1-5)                                  ║
║  npm i zustand @tanstack/react-query                         ║
║  npm i react-hook-form zod @hookform/resolvers               ║
║  npm i lucide-react sonner                                   ║
║  npm i framer-motion tailwindcss-animate                     ║
║  npm i clsx tailwind-merge date-fns                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

```
═══════════════════════════════════════════════════════════════
STANDARDS.md v2.0
Companion to ALESA Framework v7.13.0 - GENERAL EDITION

Stack Options:
- Next.js 16 | React 19 | TypeScript | Tailwind | Prisma (Primary)
- Laravel 10/11 | Blade/Vue | MariaDB | LiteSpeed (Existing)

Philosophy: Mobile-First, Native Feel, Production Ready
Scope: Universal - All Projects (Current & Future)
═══════════════════════════════════════════════════════════════
```
