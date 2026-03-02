"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Warning, Confetti } from "@phosphor-icons/react";

// ─── Brunei & Malaysia Public Holidays 2026 ───
const HOLIDAYS_2026 = [
    { date: "2026-01-01", name: "New Year's Day", country: "both" },
    { date: "2026-01-29", name: "Chinese New Year", country: "both" },
    { date: "2026-01-30", name: "Chinese New Year (Day 2)", country: "MY" },
    { date: "2026-02-23", name: "Brunei National Day", country: "BN" },
    { date: "2026-03-20", name: "Nuzul Al-Quran", country: "both" },
    { date: "2026-03-21", name: "Israk & Mikraj", country: "BN" },
    { date: "2026-04-02", name: "Good Friday", country: "MY" },
    { date: "2026-05-01", name: "Labour Day", country: "both" },
    { date: "2026-05-15", name: "Royal Brunei Armed Forces Day", country: "BN" },
    { date: "2026-05-31", name: "Hari Raya Aidilfitri", country: "both" },
    { date: "2026-06-01", name: "Hari Raya Aidilfitri (Day 2)", country: "both" },
    { date: "2026-06-07", name: "Agong Birthday", country: "MY" },
    { date: "2026-07-15", name: "Sultan's Birthday", country: "BN" },
    { date: "2026-08-07", name: "Hari Raya Haji", country: "both" },
    { date: "2026-08-08", name: "Hari Raya Haji (Day 2)", country: "both" },
    { date: "2026-08-28", name: "Awal Muharram", country: "both" },
    { date: "2026-08-31", name: "Malaysia Day", country: "MY" },
    { date: "2026-09-16", name: "Malaysia Day", country: "MY" },
    { date: "2026-10-29", name: "Deepavali", country: "MY" },
    { date: "2026-11-06", name: "Mawlid Nabi", country: "both" },
    { date: "2026-12-25", name: "Christmas Day", country: "both" },
];

export const HolidayAlert = () => {
    const upcoming = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return HOLIDAYS_2026
            .filter((h) => {
                const hDate = new Date(h.date);
                const diffDays = Math.ceil((hDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 14;
            })
            .map((h) => {
                const hDate = new Date(h.date);
                const diffDays = Math.ceil((hDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return { ...h, daysAway: diffDays, dateObj: hDate };
            })
            .slice(0, 3);
    }, []);

    if (upcoming.length === 0) return null;

    const getUrgencyStyle = (days: number) => {
        if (days <= 2) return {
            bg: "rgba(239, 68, 68, 0.08)",
            border: "rgba(239, 68, 68, 0.2)",
            color: "var(--status-congested)",
            label: "🔴 Expect heavy traffic!",
        };
        if (days <= 5) return {
            bg: "rgba(245, 158, 11, 0.08)",
            border: "rgba(245, 158, 11, 0.2)",
            color: "var(--status-moderate)",
            label: "🟡 Plan your crossing early",
        };
        return {
            bg: "rgba(16, 185, 129, 0.05)",
            border: "rgba(16, 185, 129, 0.15)",
            color: "var(--status-smooth)",
            label: "📅 Holiday coming up",
        };
    };

    const countryLabel = (c: string) => {
        if (c === "both") return "🇧🇳 🇲🇾";
        if (c === "BN") return "🇧🇳";
        return "🇲🇾";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="clean-card overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <CalendarCheck size={16} weight="fill" style={{ color: "var(--secondary)" }} />
                <span className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}>
                    Holiday Alert
                </span>
            </div>

            {/* Holiday Cards */}
            <div>
                {upcoming.map((h, i) => {
                    const urgency = getUrgencyStyle(h.daysAway);
                    return (
                        <div key={i}
                            className="px-4 py-3 flex items-center gap-3"
                            style={{
                                background: urgency.bg,
                                borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none",
                            }}
                        >
                            <Confetti size={18} weight="fill" style={{ color: urgency.color }} />
                            <div className="flex-1">
                                <p className="text-sm font-bold flex items-center gap-2">
                                    {h.name}
                                    <span className="text-[10px]">{countryLabel(h.country)}</span>
                                </p>
                                <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                    {h.dateObj.toLocaleDateString("en-MY", { weekday: "short", month: "short", day: "numeric" })}
                                    {" · "}
                                    {h.daysAway === 0 ? (
                                        <span style={{ color: urgency.color }} className="font-bold">TODAY</span>
                                    ) : h.daysAway === 1 ? (
                                        <span style={{ color: urgency.color }} className="font-bold">TOMORROW</span>
                                    ) : (
                                        <span>{h.daysAway} days away</span>
                                    )}
                                </p>
                            </div>
                            {h.daysAway <= 2 && (
                                <Warning size={16} weight="fill" style={{ color: urgency.color }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tip */}
            <div className="px-4 py-2.5" style={{ background: "var(--muted)" }}>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    💡 Tip: Cross early morning (6-8 AM) on holiday weekends to avoid long queues
                </p>
            </div>
        </motion.div>
    );
};
