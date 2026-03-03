"use client";

import { motion } from "framer-motion";
import {
    NavigationArrow,
    MapPin,
    Car,
    Warning,
    Crosshair,
} from "@phosphor-icons/react";
import {
    useGeolocation,
    BORDER_COORDS,
    getDistanceKm,
    getNearestBorder,
    estimateDriveTime,
} from "@/hooks/useGeolocation";
import { useState, useEffect } from "react";

export const NearestBorder = () => {
    const { position, loading, error, requestLocation, denied } = useGeolocation();
    const [locationEnabled, setLocationEnabled] = useState(true);

    // Respect the location_enabled setting from Settings page
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("location_enabled");
            // Default to true if never set (first-time users still see it)
            setLocationEnabled(saved === null ? true : saved === "true");
        }
        // Listen for storage changes (in case toggle changes while on main page)
        const handleStorage = () => {
            const saved = localStorage.getItem("location_enabled");
            setLocationEnabled(saved === null ? true : saved === "true");
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    // If location is disabled in Settings, hide this component
    if (!locationEnabled) return null;
    if (!position && !loading && !error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="clean-card p-4"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--primary-subtle)" }}>
                            <NavigationArrow size={20} weight="fill" style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Find Nearest Border</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                See distance & estimated drive time
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={requestLocation}
                        className="haptic-btn btn-primary text-xs px-3 py-2"
                    >
                        <span className="flex items-center gap-1.5">
                            <Crosshair size={14} weight="bold" />
                            Enable
                        </span>
                    </button>
                </div>
                <p className="text-[10px] mt-3 px-1" style={{ color: "var(--muted-foreground)" }}>
                    🔒 Your location is never stored or shared. Used only to calculate distance.
                </p>
            </motion.div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="clean-card p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl skeleton" />
                    <div className="space-y-2 flex-1">
                        <div className="skeleton h-4 w-40" />
                        <div className="skeleton h-3 w-28" />
                    </div>
                </div>
            </div>
        );
    }

    // Denied
    if (denied) {
        const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
        return (
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="clean-card p-4 space-y-3"
            >
                <div className="flex items-center gap-3">
                    <Warning size={20} weight="fill" style={{ color: "var(--status-moderate)" }} />
                    <div>
                        <p className="text-sm font-bold">Location Access Denied</p>
                        <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                            {isAndroid
                                ? "Enable location in Chrome settings for this site"
                                : "Enable in Settings → Safari → Location Services"}
                        </p>
                    </div>
                </div>

                {/* Step-by-step instructions */}
                <div className="px-3 py-2.5 rounded-xl text-[11px] space-y-1.5"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {isAndroid ? (
                        <>
                            <p className="font-bold" style={{ color: "var(--foreground)" }}>📱 How to enable on Android:</p>
                            <p>1. Tap the <strong>⋮ menu</strong> (top right) → <strong>Settings</strong></p>
                            <p>2. <strong>Site settings</strong> → <strong>Location</strong></p>
                            <p>3. Find this site → set to <strong>Allow</strong></p>
                            <p>4. Come back and tap <strong>Try Again</strong></p>
                        </>
                    ) : (
                        <>
                            <p className="font-bold" style={{ color: "var(--foreground)" }}>📱 How to enable:</p>
                            <p>1. Open <strong>Settings</strong> → <strong>Safari</strong> (or browser)</p>
                            <p>2. <strong>Location</strong> → set to <strong>Allow</strong></p>
                            <p>3. Come back and tap <strong>Try Again</strong></p>
                        </>
                    )}
                </div>

                {/* Retry button */}
                <button
                    onClick={requestLocation}
                    className="haptic-btn btn-primary text-xs px-4 py-2 w-full rounded-xl font-bold"
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <Crosshair size={14} weight="bold" />
                        Try Again
                    </span>
                </button>
            </motion.div>
        );
    }

    // Got position — show distances
    if (position) {
        const nearest = getNearestBorder(position.lat, position.lng);

        // Calculate all distances and sort
        const distances = Object.entries(BORDER_COORDS)
            .map(([name, coords]) => ({
                name,
                shortName: coords.shortName,
                distance: getDistanceKm(position.lat, position.lng, coords.lat, coords.lng),
            }))
            .sort((a, b) => a.distance - b.distance);

        return (
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="clean-card overflow-hidden"
            >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} weight="fill" style={{ color: "var(--primary)" }} />
                        <span className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: "var(--muted-foreground)" }}>
                            Distance to Borders
                        </span>
                    </div>
                    <button onClick={requestLocation} className="haptic-btn p-1.5 rounded-lg"
                        style={{ background: "var(--muted)" }}>
                        <Crosshair size={14} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                    </button>
                </div>

                {/* Distance List */}
                <div>
                    {distances.map((item, i) => (
                        <div key={item.name}
                            className="flex items-center justify-between px-4 py-3"
                            style={{
                                borderBottom: i < distances.length - 1 ? "1px solid var(--border)" : "none",
                                background: i === 0 ? "var(--primary-subtle)" : "transparent",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-extrabold w-8"
                                    style={{ color: i === 0 ? "var(--primary)" : "var(--muted-foreground)" }}>
                                    {item.shortName}
                                </span>
                                <span className="text-sm font-semibold">{item.name}</span>
                                {i === 0 && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: "var(--primary)", color: "white" }}>
                                        NEAREST
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-sm font-bold">{item.distance.toFixed(1)} km</p>
                                    <p className="text-[10px] flex items-center gap-1 justify-end"
                                        style={{ color: "var(--muted-foreground)" }}>
                                        <Car size={10} weight="fill" />
                                        {estimateDriveTime(item.distance)}
                                    </p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${BORDER_COORDS[item.name]?.lat},${BORDER_COORDS[item.name]?.lng}&travelmode=driving`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="haptic-btn h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(51,124,253,0.1)" }}
                                    title="Navigate"
                                >
                                    <NavigationArrow size={12} weight="fill" style={{ color: "var(--primary)" }} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    return null;
};
