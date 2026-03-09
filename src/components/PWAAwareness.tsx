"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
    DownloadSimple,
    X,
    DeviceMobile,
    Monitor,
    Info,
    ShareNetwork,
} from "@phosphor-icons/react";

export const PWAAwareness = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Already dismissed this session?
        if (sessionStorage.getItem("pwa-dismissed")) return;

        // Check if already installed as PWA
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(standalone);

        // iOS detection (Safari on iPhone/iPad)
        const ios =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Only show for iOS — Android Chrome has its own built-in install prompt
        if (!standalone && ios) {
            const timer = setTimeout(() => setIsVisible(true), 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setDismissed(true);
        sessionStorage.setItem("pwa-dismissed", "1");
    };

    if (!isVisible || isStandalone || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                /* Sits above bottom nav (72px) + safe area */
                className="fixed left-4 right-4 z-[200]"
                style={{
                    bottom: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 12px)",
                }}
            >
                <div
                    className="glass-card rounded-3xl p-5 relative overflow-hidden"
                    style={{
                        background: "rgba(6, 13, 26, 0.96)",
                        border: "1px solid rgba(51,124,253,0.25)",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(51,124,253,0.1)",
                    }}
                >
                    {/* Glow accent */}
                    <div
                        className="absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 pointer-events-none"
                        style={{
                            background: "radial-gradient(circle, rgba(51,124,253,0.15) 0%, transparent 70%)",
                        }}
                    />

                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-2 rounded-full transition-all"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                        aria-label="Dismiss"
                    >
                        <X size={14} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "var(--primary-subtle)",
                                border: "1px solid rgba(51,124,253,0.2)",
                            }}
                        >
                            <DownloadSimple size={22} weight="bold" color="var(--primary)" />
                        </div>
                        <div>
                            <p className="text-sm font-black leading-tight">Install BorderIQ</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                Add to home screen for instant access
                            </p>
                        </div>
                    </div>

                    {/* Platform-specific instructions */}
                    {isIOS ? (
                        <div
                            className="flex items-start gap-3 p-3 rounded-2xl mb-3"
                            style={{ background: "rgba(51,124,253,0.08)", border: "1px solid rgba(51,124,253,0.15)" }}
                        >
                            <ShareNetwork size={16} color="var(--primary)" weight="bold" className="flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                Tap the{" "}
                                <span style={{ color: "var(--primary)" }}>Share</span>
                                {" "}button ↑ then select{" "}
                                <span style={{ color: "var(--primary)" }}>"Add to Home Screen"</span>
                            </p>
                        </div>
                    ) : (
                        <div
                            className="flex items-start gap-3 p-3 rounded-2xl mb-3"
                            style={{ background: "rgba(51,124,253,0.08)", border: "1px solid rgba(51,124,253,0.15)" }}
                        >
                            <Monitor size={16} color="var(--primary)" weight="bold" className="flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                Open browser menu <span style={{ color: "var(--primary)" }}>⋮</span> → tap{" "}
                                <span style={{ color: "var(--primary)" }}>"Install App"</span>
                            </p>
                        </div>
                    )}

                    {/* Footer badge */}
                    <div className="flex items-center gap-1.5 px-1">
                        <Info size={10} style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
                        <span
                            className="text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
                        >
                            Free · No app store required · Works offline
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
