import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://images.unsplash.com https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.basemaps.cartocdn.com https://api.tomtom.com https://api.telegram.org https://fcm.googleapis.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
              "worker-src 'self' blob:",
              "frame-src 'self'",
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
