"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, Warning, Siren } from "@phosphor-icons/react";

interface QueueCardProps {
    location: string;
    queueTime: string;
    status: "smooth" | "moderate" | "congested";
    lastUpdated: string;
    loading?: boolean;
}

const statusConfig = {
    smooth: {
        label: "Clear",
        color: "var(--status-smooth)",
        bg: "rgba(34, 197, 94, 0.08)",
        border: "rgba(34, 197, 94, 0.2)",
        Icon: CheckCircle,
    },
    moderate: {
        label: "Moderate",
        color: "var(--secondary)",
        bg: "var(--secondary-subtle)",
        border: "rgba(255,130,76,0.2)",
        Icon: Warning,
    },
    congested: {
        label: "Congested",
        color: "var(--status-congested)",
        bg: "rgba(239, 68, 68, 0.08)",
        border: "rgba(239,68,68,0.2)",
        Icon: Siren,
    },
};

export const QueueCard = ({ location, queueTime, status, lastUpdated, loading }: QueueCardProps) => {
    const cfg = statusConfig[status] || statusConfig.smooth;
    const { Icon } = cfg;
    const mins = parseInt(queueTime, 10);

    if (loading) {
        return (
            <div className="rounded-3xl p-5 animate-pulse"
                style={{ height: 100, background: "var(--surface-1)" }} />
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-5 flex items-center gap-4"
        >
            {/* Left accent bar */}
            <div className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ background: cfg.color }} />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider mb-1 truncate"
                    style={{ color: "var(--muted-foreground)" }}>{location}</p>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tabular-nums tracking-tight">
                        {isNaN(mins) ? "—" : mins}
                    </span>
                    {!isNaN(mins) && (
                        <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>min</span>
                    )}
                </div>
            </div>

            {/* Right: status pill + time */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {/* Status badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon size={11} weight="fill" color={cfg.color} />
                    <span className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: cfg.color }}>
                        {cfg.label}
                    </span>
                </div>
                {/* Last updated */}
                <div className="flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                    <Clock size={10} />
                    <span className="text-[9px] font-medium">{lastUpdated}</span>
                </div>
            </div>
        </motion.div>
    );
};
