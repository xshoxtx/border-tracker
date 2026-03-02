"use client";

import { motion } from "framer-motion";
import {
    CheckCircle,
    Warning,
    WarningOctagon,
    ArrowsClockwise,
} from "@phosphor-icons/react";

interface StatusBannerProps {
    trafficData: any;
    loading: boolean;
    onRefresh: () => void;
}

export const StatusBanner = ({ trafficData, loading, onRefresh }: StatusBannerProps) => {
    // Calculate overall status from all borders
    const getOverallStatus = () => {
        if (!trafficData) return { status: "loading", label: "Checking borders...", count: { clear: 0, moderate: 0, jammed: 0 } };

        const entries = Object.values(trafficData) as any[];
        let clear = 0, moderate = 0, jammed = 0;

        entries.forEach((entry: any) => {
            if (entry.status === "congested") jammed++;
            else if (entry.status === "moderate") moderate++;
            else clear++;
        });

        if (jammed > 0) return { status: "jammed", label: "Traffic Alert!", count: { clear, moderate, jammed } };
        if (moderate > 0) return { status: "moderate", label: "Some delays", count: { clear, moderate, jammed } };
        return { status: "clear", label: "All borders clear", count: { clear, moderate, jammed } };
    };

    const { status, label, count } = getOverallStatus();

    const statusConfig = {
        clear: { icon: CheckCircle, emoji: "🟢", bannerClass: "clear" },
        moderate: { icon: Warning, emoji: "🟡", bannerClass: "moderate" },
        jammed: { icon: WarningOctagon, emoji: "🔴", bannerClass: "jammed" },
        loading: { icon: ArrowsClockwise, emoji: "⏳", bannerClass: "clear" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.loading;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`hero-banner ${config.bannerClass}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon size={28} weight="fill" />
                    <div className="text-left">
                        <p className="text-lg font-extrabold tracking-tight">{label}</p>
                        <p className="text-[11px] font-medium opacity-70 mt-0.5">
                            Last updated: {loading ? "Refreshing..." : "Just now"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="haptic-btn p-2.5 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                >
                    <ArrowsClockwise
                        size={18}
                        weight="bold"
                        className={loading ? "animate-spin" : ""}
                    />
                </button>
            </div>

            {/* Quick Stats Row */}
            {trafficData && (
                <div className="flex gap-3 mt-4 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                    <div className="flex-1 text-center">
                        <span className="text-xl font-black">{count.clear}</span>
                        <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">Clear</p>
                    </div>
                    <div className="flex-1 text-center">
                        <span className="text-xl font-black">{count.moderate}</span>
                        <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">Moderate</p>
                    </div>
                    <div className="flex-1 text-center">
                        <span className="text-xl font-black">{count.jammed}</span>
                        <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">Jammed</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
