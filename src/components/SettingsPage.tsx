"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Shield,
    Moon,
    Info,
    CaretRight,
    Globe,
    Trash,
    ShareNetwork,
    MapPin,
    CheckCircle,
    XCircle,
    Warning,
    Crosshair,
} from "@phosphor-icons/react";
import { ThemeToggle } from "./ThemeToggle";

type LocationStatus = "granted" | "denied" | "prompt" | "unavailable" | "loading";

export const SettingsPage = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [alertThreshold, setAlertThreshold] = useState(20);
    const [showPDP, setShowPDP] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
    const [showLocationHelp, setShowLocationHelp] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);

    // Load location preference from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("location_enabled");
            setLocationEnabled(saved === "true");
        }
    }, []);

    // Toggle location on/off
    const handleToggleLocation = () => {
        const newValue = !locationEnabled;
        setLocationEnabled(newValue);
        localStorage.setItem("location_enabled", String(newValue));
        if (newValue) {
            // Turning ON — trigger browser permission if needed
            if (locationStatus === "prompt") {
                handleRequestLocation();
            }
        }
    };

    // Detect platform
    const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
    const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

    // Check location permission on mount
    const checkLocationPermission = useCallback(async () => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            setLocationStatus("unavailable");
            return;
        }
        if ("permissions" in navigator) {
            try {
                const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
                setLocationStatus(result.state as LocationStatus);
                result.onchange = () => {
                    setLocationStatus(result.state as LocationStatus);
                };
            } catch {
                // Fallback: permissions API not supported (some iOS browsers)
                setLocationStatus("prompt");
            }
        } else {
            setLocationStatus("prompt");
        }
    }, []);

    useEffect(() => {
        checkLocationPermission();
    }, [checkLocationPermission]);

    // Request location permission
    const handleRequestLocation = () => {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            () => {
                setLocationStatus("granted");
                setLocationLoading(false);
                setShowLocationHelp(false);
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setLocationStatus("denied");
                    setShowLocationHelp(true);
                }
                setLocationLoading(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    };

    // Load alert threshold from localStorage
    useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("alert_threshold");
            if (saved) setAlertThreshold(parseInt(saved));
        }
    });

    const handleThresholdChange = (value: number) => {
        setAlertThreshold(value);
        localStorage.setItem("alert_threshold", value.toString());
    };

    const handleShareApp = async () => {
        if (navigator.share) {
            await navigator.share({
                title: "Pathfinder — Border Intelligence",
                text: "Check real-time Brunei-Malaysia border queue times!",
                url: window.location.origin,
            });
        }
    };

    const handleClearCache = () => {
        if ("caches" in window) {
            caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
        }
        localStorage.clear();
        alert("Cache cleared! The app will refresh.");
        window.location.reload();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="pt-6 space-y-6"
        >
            <div>
                <h2 className="section-header">Settings</h2>
                <p className="section-subtitle">Preferences & privacy</p>
            </div>

            {/* ─── Notifications ─── */}
            <div className="clean-card overflow-hidden">
                <div className="px-5 py-3 font-bold text-xs uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                    Notifications
                </div>
                <div className="settings-item">
                    <div className="flex items-center gap-3">
                        <Bell size={20} weight="fill" style={{ color: "var(--primary)" }} />
                        <div>
                            <p className="text-sm font-semibold">Push Notifications</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                Get alerts when borders are jammed
                            </p>
                        </div>
                    </div>
                    <button
                        className={`toggle-switch ${notificationsEnabled ? "active" : ""}`}
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    />
                </div>

                {/* Alert Threshold Slider */}
                <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Bell size={16} weight="fill" style={{ color: "var(--secondary)" }} />
                            <span className="text-xs font-bold">Alert Threshold</span>
                        </div>
                        <span className="text-sm font-extrabold px-2.5 py-0.5 rounded-lg"
                            style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}>
                            {alertThreshold} min
                        </span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={60}
                        step={5}
                        value={alertThreshold}
                        onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
                        className="threshold-slider"
                    />
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] font-bold" style={{ color: "var(--muted-foreground)" }}>5 min</span>
                        <span className="text-[9px] font-bold" style={{ color: "var(--muted-foreground)" }}>60 min</span>
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
                        🔔 Alert me when any border queue is under {alertThreshold} minutes
                    </p>
                </div>
            </div>

            {/* ─── Location ─── */}
            <div className="clean-card overflow-hidden">
                <div className="px-5 py-3 font-bold text-xs uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                    Location
                </div>

                {/* Toggle row */}
                <div className="settings-item">
                    <div className="flex items-center gap-3">
                        <MapPin size={20} weight="fill" style={{ color: locationEnabled ? "var(--status-smooth)" : "var(--muted-foreground)" }} />
                        <div>
                            <p className="text-sm font-semibold">Share Location</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                {locationEnabled
                                    ? locationStatus === "granted"
                                        ? "Active — showing nearest border"
                                        : locationStatus === "denied"
                                            ? "Enabled but browser blocked"
                                            : "Enabled — tap to allow in browser"
                                    : "Disabled — nearest border hidden"}
                            </p>
                        </div>
                    </div>
                    <button
                        className={`toggle-switch ${locationEnabled ? "active" : ""}`}
                        onClick={handleToggleLocation}
                        disabled={locationLoading}
                    />
                </div>

                {/* Browser permission status (only when toggle is ON) */}
                {locationEnabled && locationStatus !== "loading" && (
                    <div className="px-5 py-2.5 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
                        {locationStatus === "granted" ? (
                            <CheckCircle size={14} weight="fill" style={{ color: "var(--status-smooth)" }} />
                        ) : locationStatus === "denied" ? (
                            <XCircle size={14} weight="fill" style={{ color: "var(--status-congested)" }} />
                        ) : (
                            <Warning size={14} weight="fill" style={{ color: "var(--status-moderate)" }} />
                        )}
                        <span className="text-[11px] font-semibold" style={{
                            color: locationStatus === "granted" ? "var(--status-smooth)"
                                : locationStatus === "denied" ? "var(--status-congested)"
                                    : "var(--status-moderate)"
                        }}>
                            {locationStatus === "granted" && "Browser permission: Allowed ✓"}
                            {locationStatus === "denied" && "Browser permission: Blocked ✗"}
                            {locationStatus === "prompt" && "Browser permission: Waiting..."}
                            {locationStatus === "unavailable" && "Not supported on this device"}
                        </span>
                    </div>
                )}

                {/* Request permission button (when enabled but not yet granted) */}
                {locationEnabled && locationStatus === "prompt" && (
                    <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                        <button
                            onClick={handleRequestLocation}
                            disabled={locationLoading}
                            className="haptic-btn btn-primary text-xs px-4 py-2.5 w-full rounded-xl font-bold"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Crosshair size={14} weight="bold" className={locationLoading ? "animate-spin" : ""} />
                                {locationLoading ? "Requesting..." : "Allow in Browser"}
                            </span>
                        </button>
                    </div>
                )}

                {/* Platform-specific instructions when denied */}
                {locationEnabled && locationStatus === "denied" && (
                    <>
                        <button
                            className="settings-item w-full"
                            onClick={() => setShowLocationHelp(!showLocationHelp)}
                            style={{ borderTop: "1px solid var(--border)" }}
                        >
                            <div className="flex items-center gap-3">
                                <Warning size={18} weight="fill" style={{ color: "var(--status-moderate)" }} />
                                <p className="text-xs font-bold" style={{ color: "var(--status-moderate)" }}>
                                    📱 How to enable location
                                </p>
                            </div>
                            <CaretRight size={14} weight="bold"
                                style={{ color: "var(--muted-foreground)", transform: showLocationHelp ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                        </button>

                        {showLocationHelp && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="px-5 py-4 text-[11px] space-y-2"
                                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                            >
                                {isAndroid ? (
                                    <>
                                        <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>📱 Android (Chrome / PWA):</p>
                                        <p>1. Tap the <strong>⋮</strong> icon (top right) → <strong>Settings</strong></p>
                                        <p>2. <strong>Site settings</strong> → <strong>Location</strong></p>
                                        <p>3. Find this site → set to <strong>Allow</strong></p>
                                        <p>4. Come back and tap <strong>Try Again</strong></p>
                                        <p className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                                            💡 <strong>For PWA</strong>: Open Chrome → ⋮ → Settings → Site settings → Location → find &quot;border.creativepresslab.com&quot; → Allow
                                        </p>
                                    </>
                                ) : isIOS ? (
                                    <>
                                        <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>📱 iPhone / iPad:</p>
                                        <p>1. Open <strong>Settings</strong></p>
                                        <p>2. Scroll to <strong>Safari</strong> (or your browser)</p>
                                        <p>3. Tap <strong>Location</strong> → select <strong>Allow</strong></p>
                                        <p>4. Come back and tap <strong>Try Again</strong></p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>🖥️ Desktop Browser:</p>
                                        <p>1. Click the 🔒 icon in the address bar</p>
                                        <p>2. Find <strong>Location</strong> → set to <strong>Allow</strong></p>
                                        <p>3. Refresh the page and tap <strong>Try Again</strong></p>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Try Again button */}
                        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                            <button
                                onClick={handleRequestLocation}
                                disabled={locationLoading}
                                className="haptic-btn btn-primary text-xs px-4 py-2.5 w-full rounded-xl font-bold"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Crosshair size={14} weight="bold" className={locationLoading ? "animate-spin" : ""} />
                                    {locationLoading ? "Checking..." : "Try Again"}
                                </span>
                            </button>
                        </div>
                    </>
                )}

                {/* Privacy note */}
                <div className="px-5 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        🔒 Your location is never stored or shared. Only used to calculate distance to borders.
                    </p>
                </div>
            </div>

            {/* ─── Appearance ─── */}
            <div className="clean-card overflow-hidden">
                <div className="px-5 py-3 font-bold text-xs uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                    Appearance
                </div>
                <div className="settings-item">
                    <div className="flex items-center gap-3">
                        <Moon size={20} weight="fill" style={{ color: "var(--primary)" }} />
                        <div>
                            <p className="text-sm font-semibold">Dark Mode</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                Switch between light and dark
                            </p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ─── Privacy & Legal ─── */}
            <div className="clean-card overflow-hidden">
                <div className="px-5 py-3 font-bold text-xs uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                    Privacy & Legal
                </div>

                <button className="settings-item w-full" onClick={() => setShowPDP(!showPDP)}>
                    <div className="flex items-center gap-3">
                        <Shield size={20} weight="fill" style={{ color: "var(--status-smooth)" }} />
                        <div className="text-left">
                            <p className="text-sm font-semibold">Data Protection (PDP/GDPR)</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                How we handle your data
                            </p>
                        </div>
                    </div>
                    <CaretRight size={16} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                </button>

                {showPDP && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-5 py-4 text-sm leading-relaxed"
                        style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", background: "var(--muted)" }}
                    >
                        <p className="font-bold mb-2" style={{ color: "var(--foreground)" }}>🛡️ Your Data, Your Choice</p>
                        <ul className="space-y-2 text-xs">
                            <li>• <strong>No personal data collected</strong> — We don&apos;t track your identity</li>
                            <li>• <strong>No cookies</strong> — No tracking cookies are used</li>
                            <li>• <strong>Location (optional)</strong> — Only used to show nearest border, never stored</li>
                            <li>• <strong>Push notifications</strong> — Can be disabled anytime from this page</li>
                            <li>• <strong>Chat messages</strong> — Anonymous, no login required</li>
                            <li>• <strong>Compliant</strong> — PDP (Brunei), PDPA (Malaysia), GDPR (EU)</li>
                        </ul>
                        <p className="mt-3 text-[10px] opacity-70">
                            For inquiries: privacy@creativepresslab.com
                        </p>
                    </motion.div>
                )}

                <button className="settings-item w-full" onClick={handleClearCache}>
                    <div className="flex items-center gap-3">
                        <Trash size={20} weight="fill" style={{ color: "var(--status-congested)" }} />
                        <div className="text-left">
                            <p className="text-sm font-semibold">Clear Cache</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                Free up storage & fix display issues
                            </p>
                        </div>
                    </div>
                    <CaretRight size={16} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                </button>
            </div>

            {/* ─── About & Share ─── */}
            <div className="clean-card overflow-hidden">
                <div className="px-5 py-3 font-bold text-xs uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                    About
                </div>

                <button className="settings-item w-full" onClick={() => setShowAbout(!showAbout)}>
                    <div className="flex items-center gap-3">
                        <Info size={20} weight="fill" style={{ color: "var(--primary)" }} />
                        <div className="text-left">
                            <p className="text-sm font-semibold">About Pathfinder</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                v3.0.0 — Clean Minimal Edition
                            </p>
                        </div>
                    </div>
                    <CaretRight size={16} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                </button>

                {showAbout && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-5 py-4 text-sm leading-relaxed"
                        style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", background: "var(--muted)" }}
                    >
                        <p className="text-xs">
                            <strong>Pathfinder</strong> is a free, open-source border
                            intelligence tool for Brunei-Malaysia crossings. Built with ❤️ by{" "}
                            <a href="https://creativepresslab.com" target="_blank" rel="noopener"
                                className="font-bold" style={{ color: "var(--primary)" }}>
                                CreativePressLab
                            </a>.
                        </p>
                        <p className="text-[10px] mt-2 opacity-60">
                            Powered by TomTom Traffic API • Next.js • Firebase
                        </p>
                    </motion.div>
                )}

                {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
                    <button className="settings-item w-full" onClick={handleShareApp}>
                        <div className="flex items-center gap-3">
                            <ShareNetwork size={20} weight="fill" style={{ color: "var(--secondary)" }} />
                            <div className="text-left">
                                <p className="text-sm font-semibold">Share Pathfinder</p>
                                <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                    Help others discover this app
                                </p>
                            </div>
                        </div>
                        <CaretRight size={16} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                    </button>
                )}

                <a href="https://creativepresslab.com" target="_blank" rel="noopener"
                    className="settings-item w-full block">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe size={20} weight="fill" style={{ color: "var(--primary)" }} />
                            <div className="text-left">
                                <p className="text-sm font-semibold">CreativePressLab</p>
                                <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                    Visit our studio
                                </p>
                            </div>
                        </div>
                        <CaretRight size={16} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                    </div>
                </a>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] pb-4" style={{ color: "var(--muted-foreground)" }}>
                © 2026 CreativePressLab · Pathfinder v3.0.0
            </p>
        </motion.div>
    );
};
