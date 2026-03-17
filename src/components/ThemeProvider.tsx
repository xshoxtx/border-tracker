"use client";

import { useEffect } from "react";

/**
 * ThemeProvider — Re-applies saved theme from localStorage AFTER React hydration.
 *
 * Problem: The blocking <script> in <head> correctly sets data-theme="light",
 * but React hydration overwrites it back to "dark" (the server-rendered default).
 * suppressHydrationWarning only mutes the console warning — it does NOT prevent
 * React from reconciling the attribute.
 *
 * This component renders nothing — it just fires a useEffect after mount to
 * correct the hydration overwrite. This covers:
 * - PWA cold start (iOS + Android)
 * - Full page reload
 * - bfcache restore (handled by blocking script's pageshow listener too)
 */
export function ThemeProvider() {
    useEffect(() => {
        try {
            const saved = localStorage.getItem("theme");
            if (saved === "light" || saved === "dark") {
                document.documentElement.setAttribute("data-theme", saved);
            }
        } catch (e) {
            // localStorage may be unavailable in private browsing edge cases
        }
    }, []);

    return null;
}
