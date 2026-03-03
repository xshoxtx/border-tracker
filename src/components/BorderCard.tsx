"use client";

import { motion } from "framer-motion";
import { Car, Clock, NavigationArrow, Star } from "@phosphor-icons/react";
import { ShareCard } from "@/components/ShareCard";

// Map border direction labels → destination GPS coords
const NAV_COORDS: Record<string, { lat: number; lng: number }> = {
    "Brunei ➔ Miri": { lat: 4.5852, lng: 114.0723 },
    "Miri ➔ Brunei": { lat: 4.5852, lng: 114.0723 },
    "Brunei ➔ Tedungan": { lat: 4.7407, lng: 114.8135 },
    "Tedungan ➔ Brunei": { lat: 4.7407, lng: 114.8135 },
    "Brunei ➔ Pandaruan": { lat: 4.6890, lng: 115.0393 },
    "Pandaruan ➔ Brunei": { lat: 4.6890, lng: 115.0393 },
    "Brunei ➔ Lawas": { lat: 4.7933, lng: 115.2363 },
    "Lawas ➔ Brunei": { lat: 4.7933, lng: 115.2363 },
};

interface BorderCardProps {
    location: string;
    queueTime: string;
    status: "smooth" | "moderate" | "congested";
    lastUpdated: string;
    loading?: boolean;
    isFavorite?: boolean;
    onFavoriteToggle?: (location: string) => void;
}

export const BorderCard = ({ location, queueTime, status, lastUpdated, loading, isFavorite, onFavoriteToggle }: BorderCardProps) => {
    if (loading) {
        return (
            <div className="status-card smooth">
                <div className="flex items-center justify-between">
                    <div className="space-y-2.5 flex-1">
                        <div className="skeleton h-4 w-32" />
                        <div className="skeleton h-8 w-20" />
                        <div className="skeleton h-3 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    const statusLabels = {
        smooth: "Clear",
        moderate: "Moderate",
        congested: "Congested",
    };

    const statusColors = {
        smooth: "var(--status-smooth)",
        moderate: "var(--status-moderate)",
        congested: "var(--status-congested)",
    };

    const coords = NAV_COORDS[location];
    const navUrl = coords
        ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`status-card ${status}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {/* Location name + favorite star */}
                    <div className="flex items-center gap-2 mb-2">
                        <Car size={16} weight="fill" style={{ color: statusColors[status] }} />
                        <span className="text-sm font-bold flex-1">{location}</span>
                        {onFavoriteToggle && (
                            <motion.button
                                whileTap={{ scale: 1.3 }}
                                onClick={(e) => { e.stopPropagation(); onFavoriteToggle(location); }}
                                className="haptic-btn p-1 -mr-1"
                                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star
                                    size={18}
                                    weight={isFavorite ? "fill" : "regular"}
                                    style={{ color: isFavorite ? "#ff824c" : "var(--muted-foreground)", transition: "color 0.2s" }}
                                />
                            </motion.button>
                        )}
                    </div>

                    {/* Queue time — BIG */}
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: statusColors[status] }}>
                        {queueTime}
                    </p>

                    {/* Status + last updated */}
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`pill-badge ${status}`}>
                            {statusLabels[status]}
                        </span>
                        <span className="text-[10px] font-medium flex items-center gap-1"
                            style={{ color: "var(--muted-foreground)" }}>
                            <Clock size={10} weight="bold" />
                            {lastUpdated}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <ShareCard border={location} queueTime={queueTime} status={status} />
                    {navUrl && (
                        <a
                            href={navUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="haptic-btn h-8 w-8 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(51,124,253,0.1)" }}
                            title="Navigate"
                        >
                            <NavigationArrow size={16} weight="fill" style={{ color: "var(--primary)" }} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
