import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { NotificationRegister } from "@/components/NotificationRegister";

const GA_ID = "G-53KPQLQ6E9";

const airbnbCereal = localFont({
  src: [
    { path: "../../public/fonts/AirbnbCereal_W_Lt.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/AirbnbCereal_W_Bk.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/AirbnbCereal_W_Md.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/AirbnbCereal_W_Bd.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/AirbnbCereal_W_XBd.otf", weight: "800", style: "normal" },
    { path: "../../public/fonts/AirbnbCereal_W_Blk.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-cereal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "BorderIQ | Smart Border Intelligence",
  description: "Real-time Malaysia–Brunei border queue monitoring — your smarter crossing companion.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BorderIQ",
    startupImage: "/apple-touch-icon.png",
  },
  other: {
    // iOS PWA meta tags
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "BorderIQ",
    // Prevent phone number detection
    "format-detection": "telephone=no",
  },
  icons: {
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",      // CRITICAL for iPad/iPhone notch + safe-area
  themeColor: "#060d1a",     // Match new OLED background
  // NOTE: maximumScale removed — allows native pinch-zoom (accessibility)
};

// Blocking script to apply saved theme BEFORE React hydrates (prevents flash)
// Uses data-theme attribute — immune to React className hydration conflicts on iOS PWA
const themeScript = `
(function(){
  function applyTheme() {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'light' || t === 'dark') {
        document.documentElement.setAttribute('data-theme', t);
      }
    } catch(e){}
  }
  // Apply immediately on first load
  applyTheme();
  // Re-apply on bfcache restore (iOS PWA reopen from frozen snapshot)
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) applyTheme();
  });
  // Re-apply on visibility change (iOS PWA app switch / tab return)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) applyTheme();
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={airbnbCereal.variable} suppressHydrationWarning>
      <head>
        {/* Theme: blocking script — must run BEFORE React hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* GA4 — afterInteractive: loads after page is interactive, doesn't block render */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <body
        className="antialiased min-h-dvh bg-background text-foreground"
        style={{ fontFamily: "var(--font-cereal), system-ui, -apple-system, sans-serif" }}
      >
        {/* Brand ambient glow */}
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(51,124,253,0.10) 0%, transparent 70%)",
          }}
        />
        <main className="relative z-0">
          <NotificationRegister />
          {children}
        </main>
      </body>
    </html>
  );
}
