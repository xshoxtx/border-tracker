"use client";

import { motion } from "framer-motion";
import { Car, Clock } from "@phosphor-icons/react";
import { ShareCard } from "@/components/ShareCard";

interface BorderCardProps {
    location: string;
    queueTime: string;
    status: "smooth" | "moderate" | "congested";
    lastUpdated: string;
    loading?: boolean;
}

export const BorderCard = ({ location, queueTime, status, lastUpdated, loading }: BorderCardProps) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`status-card ${status}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {/* Location name */}
                    <div className="flex items-center gap-2 mb-2">
                        <Car size={16} weight="fill" style={{ color: statusColors[status] }} />
                        <span className="text-sm font-bold">{location}</span>
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

                <ShareCard border={location} queueTime={queueTime} status={status} />
            </div>
        </motion.div>
    );
};
