"use client";

import { useState } from "react";
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
} from "@phosphor-icons/react";
import { ThemeToggle } from "./ThemeToggle";

export const SettingsPage = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [alertThreshold, setAlertThreshold] = useState(20);
    const [showPDP, setShowPDP] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

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
