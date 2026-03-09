"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Warning, Confetti, Clock } from "@phosphor-icons/react";

// ─── Brunei & Malaysia Public Holidays 2026 ───
// Sources: timeanddate.com, officeholidays.com, cutisekolah.com.my, publicholidays.com.my
// Islamic dates are tentative (based on lunar calendar projections)
const HOLIDAYS_2026 = [
    { date: "2026-01-01", name: "New Year's Day", country: "both", severity: "moderate" },
    { date: "2026-01-17", name: "Israk & Mikraj", country: "BN", severity: "low" },
    { date: "2026-02-01", name: "Thaipusam", country: "MY", severity: "low" },
    { date: "2026-02-17", name: "Chinese New Year", country: "both", severity: "high" },
    { date: "2026-02-18", name: "Chinese New Year (Day 2)", country: "MY", severity: "high" },
    { date: "2026-02-19", name: "Start of Ramadan", country: "BN", severity: "moderate" },
    { date: "2026-02-23", name: "Brunei National Day", country: "BN", severity: "high" },
    { date: "2026-03-07", name: "Nuzul Al-Quran", country: "both", severity: "moderate" },
    { date: "2026-03-21", name: "Hari Raya Aidilfitri", country: "both", severity: "extreme" },
    { date: "2026-03-22", name: "Hari Raya Aidilfitri (Day 2)", country: "both", severity: "extreme" },
    { date: "2026-04-03", name: "Good Friday", country: "MY", severity: "low" },
    { date: "2026-05-01", name: "Labour Day", country: "both", severity: "moderate" },
    { date: "2026-05-27", name: "Hari Raya Haji", country: "both", severity: "high" },
    { date: "2026-05-28", name: "Hari Raya Haji (Day 2)", country: "both", severity: "high" },
    { date: "2026-05-31", name: "Wesak Day", country: "MY", severity: "low" },
    { date: "2026-06-01", name: "Agong Birthday", country: "MY", severity: "low" },
    { date: "2026-06-17", name: "Awal Muharram", country: "both", severity: "low" },
    { date: "2026-07-15", name: "Sultan's Birthday", country: "BN", severity: "moderate" },
    { date: "2026-08-25", name: "Mawlid Nabi", country: "both", severity: "low" },
    { date: "2026-08-31", name: "Merdeka Day", country: "MY", severity: "moderate" },
    { date: "2026-09-16", name: "Malaysia Day", country: "MY", severity: "moderate" },
    { date: "2026-11-08", name: "Deepavali", country: "MY", severity: "moderate" },
    { date: "2026-12-25", name: "Christmas Day", country: "both", severity: "high" },
];

// Predicted queue time based on holiday severity
const QUEUE_PREDICTIONS: Record<string, { min: string; peak: string; advice: string }> = {
    extreme: { min: "45-90", peak: "2-3 hrs", advice: "Cross before 6am or after 9pm" },
    high: { min: "30-60", peak: "1-2 hrs", advice: "Cross before 7am to avoid surge" },
    moderate: { min: "15-30", peak: "45-60", advice: "Expect moderate delays at peak hours" },
    low: { min: "10-20", peak: "20-30", advice: "Slightly busier than normal" },
};

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

    const getUrgencyStyle = (severity: string, days: number) => {
        if (severity === "extreme" || (days <= 1 && severity === "high")) return {
            bg: "rgba(239, 68, 68, 0.08)",
            border: "rgba(239, 68, 68, 0.2)",
            color: "var(--status-congested)",
        };
        if (days <= 3 || severity === "high") return {
            bg: "rgba(245, 158, 11, 0.08)",
            border: "rgba(245, 158, 11, 0.2)",
            color: "var(--status-moderate)",
        };
        return {
            bg: "rgba(16, 185, 129, 0.05)",
            border: "rgba(16, 185, 129, 0.15)",
            color: "var(--status-smooth)",
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
                    const urgency = getUrgencyStyle(h.severity, h.daysAway);
                    const prediction = QUEUE_PREDICTIONS[h.severity];
                    return (
                        <div key={i}
                            className="px-4 py-3"
                            style={{
                                background: urgency.bg,
                                borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none",
                            }}
                        >
                            <div className="flex items-center gap-3">
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

                            {/* Queue Prediction — shown for holidays within 5 days */}
                            {h.daysAway <= 5 && prediction && (
                                <div className="mt-2 ml-8 flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                                    style={{ background: "rgba(0,0,0,0.04)" }}>
                                    <Clock size={12} weight="bold" style={{ color: urgency.color }} />
                                    <span className="text-[10px] font-bold" style={{ color: urgency.color }}>
                                        Expected: {prediction.min} min · Peak: {prediction.peak}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tip — use the nearest holiday's advice */}
            <div className="px-4 py-2.5" style={{ background: "var(--muted)" }}>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    💡 {upcoming[0] && QUEUE_PREDICTIONS[upcoming[0].severity]
                        ? QUEUE_PREDICTIONS[upcoming[0].severity].advice
                        : "Cross early morning (6-8 AM) on holiday weekends to avoid long queues"}
                </p>
            </div>
        </motion.div>
    );
};
