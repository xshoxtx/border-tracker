"use client";

import { motion } from "framer-motion";
import { Clock, Sun, Moon, CalendarBlank } from "@phosphor-icons/react";

// ─── Historical pattern data (based on typical Brunei-Miri crossing patterns) ───
const BEST_TIMES = [
    {
        period: "Early Morning",
        time: "6:00 - 8:00 AM",
        icon: Sun,
        rating: "best",
        ratingLabel: "Best",
        ratingColor: "var(--status-smooth)",
        note: "Shortest queues, most efficient",
    },
    {
        period: "Mid Morning",
        time: "8:00 - 11:00 AM",
        icon: Sun,
        rating: "good",
        ratingLabel: "Good",
        ratingColor: "var(--status-smooth)",
        note: "Still manageable before lunch rush",
    },
    {
        period: "Lunch Time",
        time: "11:00 AM - 2:00 PM",
        icon: Clock,
        rating: "moderate",
        ratingLabel: "Moderate",
        ratingColor: "var(--status-moderate)",
        note: "Expect 15-30 min waits",
    },
    {
        period: "Afternoon",
        time: "2:00 - 5:00 PM",
        icon: Sun,
        rating: "good",
        ratingLabel: "Good",
        ratingColor: "var(--status-smooth)",
        note: "Lunch rush subsides",
    },
    {
        period: "Evening Rush",
        time: "5:00 - 7:00 PM",
        icon: Moon,
        rating: "busy",
        ratingLabel: "Busy",
        ratingColor: "var(--status-congested)",
        note: "Peak return traffic, 30-60 min waits",
    },
    {
        period: "Night",
        time: "7:00 - 10:00 PM",
        icon: Moon,
        rating: "moderate",
        ratingLabel: "Moderate",
        ratingColor: "var(--status-moderate)",
        note: "Gradually clears after 8 PM",
    },
];

const WEEKLY_PATTERN = [
    { day: "Mon", level: 1 },
    { day: "Tue", level: 1 },
    { day: "Wed", level: 1 },
    { day: "Thu", level: 2 },
    { day: "Fri", level: 3 },
    { day: "Sat", level: 3 },
    { day: "Sun", level: 2 },
];

export const BestTimeWidget = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0=Sun

    // Determine current time slot
    const getCurrentSlot = () => {
        if (currentHour >= 6 && currentHour < 8) return 0;
        if (currentHour >= 8 && currentHour < 11) return 1;
        if (currentHour >= 11 && currentHour < 14) return 2;
        if (currentHour >= 14 && currentHour < 17) return 3;
        if (currentHour >= 17 && currentHour < 19) return 4;
        return 5;
    };

    const currentSlot = getCurrentSlot();

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="clean-card overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <Clock size={16} weight="fill" style={{ color: "var(--primary)" }} />
                <span className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}>
                    Best Time to Cross
                </span>
            </div>

            {/* Time Slots */}
            <div>
                {BEST_TIMES.map((slot, i) => {
                    const Icon = slot.icon;
                    const isCurrent = i === currentSlot;
                    return (
                        <div key={i}
                            className="flex items-center gap-3 px-4 py-2.5"
                            style={{
                                borderBottom: i < BEST_TIMES.length - 1 ? "1px solid var(--border)" : "none",
                                background: isCurrent ? "var(--primary-subtle)" : "transparent",
                            }}
                        >
                            <Icon size={14} weight="fill"
                                style={{ color: isCurrent ? "var(--primary)" : "var(--muted-foreground)" }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold flex items-center gap-2">
                                    {slot.time}
                                    {isCurrent && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: "var(--primary)", color: "white" }}>
                                            NOW
                                        </span>
                                    )}
                                </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${slot.ratingColor}15`, color: slot.ratingColor }}>
                                {slot.ratingLabel}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Weekly Pattern */}
            <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                    <CalendarBlank size={12} weight="fill" style={{ color: "var(--muted-foreground)" }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--muted-foreground)" }}>
                        Weekly Pattern
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {WEEKLY_PATTERN.map((d, i) => {
                        const dayIndex = i === 6 ? 0 : i + 1; // Map to JS day
                        const isToday = dayIndex === currentDay;
                        const levelColors = ["var(--status-smooth)", "var(--status-moderate)", "var(--status-congested)"];
                        return (
                            <div key={d.day} className="flex-1 text-center">
                                <div className="h-6 rounded-md mb-1 flex items-center justify-center"
                                    style={{
                                        background: `${levelColors[d.level - 1]}${isToday ? '' : '20'}`,
                                        border: isToday ? `2px solid ${levelColors[d.level - 1]}` : "none",
                                    }}
                                >
                                    {isToday && (
                                        <span className="text-[7px] font-black" style={{ color: levelColors[d.level - 1] }}>
                                            ●
                                        </span>
                                    )}
                                </div>
                                <span className="text-[9px] font-bold"
                                    style={{ color: isToday ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                    {d.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
