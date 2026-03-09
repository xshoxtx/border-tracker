"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChartBar, CaretDown, Star, Warning } from "@phosphor-icons/react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BORDERS = [
    "Brunei ➔ Miri",
    "Miri ➔ Brunei",
    "Brunei ➔ Kuala Lurah",
    "Kuala Lurah ➔ Brunei",
    "Brunei ➔ Pandaruan",
    "Pandaruan ➔ Brunei",
    "Brunei ➔ Lawas",
    "Lawas ➔ Brunei",
];

// Show hours 5am to 11pm (most relevant)
const DISPLAY_HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5-23

interface HeatmapSlot {
    day: number;
    hour: number;
    avg: number;
    count: number;
}

function getColor(avg: number): string {
    if (avg === 0) return "rgba(255,255,255,0.03)";
    if (avg <= 15) return "rgba(16,185,129,0.6)";   // green
    if (avg <= 30) return "rgba(245,158,11,0.5)";    // yellow
    if (avg <= 45) return "rgba(249,115,22,0.6)";    // orange
    return "rgba(239,68,68,0.7)";                     // red
}

function formatHour(h: number): string {
    if (h === 0) return "12a";
    if (h < 12) return `${h}a`;
    if (h === 12) return "12p";
    return `${h - 12}p`;
}

export const QueueHeatmap = () => {
    const [border, setBorder] = useState(BORDERS[0]);
    const [grid, setGrid] = useState<HeatmapSlot[]>([]);
    const [best, setBest] = useState<{ day: number; hour: number; avg: number } | null>(null);
    const [worst, setWorst] = useState<{ day: number; hour: number; avg: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchHeatmap();
    }, [border]);

    const fetchHeatmap = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/heatmap?border=${encodeURIComponent(border)}`);
            const json = await res.json();
            if (json.success && json.grid) {
                setGrid(json.grid);
                setBest(json.best);
                setWorst(json.worst);
                setNoData(false);
            } else {
                setGrid([]);
                setNoData(true);
            }
        } catch {
            setNoData(true);
        } finally {
            setLoading(false);
        }
    };

    const getSlot = (day: number, hour: number) =>
        grid.find((s) => s.day === day && s.hour === hour);

    // Current day/hour highlight
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 rounded-2xl space-y-3"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChartBar size={18} weight="fill" style={{ color: "var(--primary)" }} />
                    <h3 className="text-sm font-bold">Queue Patterns</h3>
                </div>

                {/* Border picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="haptic-btn flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "var(--card-bg)", color: "var(--muted-foreground)" }}
                    >
                        {border.split("➔")[0].trim()}
                        <CaretDown size={10} weight="bold" />
                    </button>
                    {showPicker && (
                        <div
                            className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-lg"
                            style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
                        >
                            {BORDERS.map((b) => (
                                <button
                                    key={b}
                                    onClick={() => { setBorder(b); setShowPicker(false); }}
                                    className="block w-full text-left text-[10px] font-semibold px-3 py-2 hover:opacity-80 whitespace-nowrap"
                                    style={{
                                        background: b === border ? "var(--primary-subtle)" : "transparent",
                                        color: b === border ? "var(--primary)" : "var(--foreground)",
                                    }}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    <div className="skeleton h-4 w-48" />
                    <div className="skeleton h-32 w-full rounded-xl" />
                </div>
            ) : noData ? (
                <div className="text-center py-6">
                    <ChartBar size={32} weight="thin" style={{ color: "var(--muted-foreground)", margin: "0 auto" }} />
                    <p className="text-xs font-semibold mt-2" style={{ color: "var(--muted-foreground)" }}>
                        Collecting data... Check back in 24 hours
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Queue patterns will appear here once we have enough data
                    </p>
                </div>
            ) : (
                <>
                    {/* Best/Worst indicators */}
                    <div className="flex gap-2">
                        {best && best.avg < Infinity && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: "rgba(16,185,129,0.1)", color: "var(--status-smooth)" }}>
                                <Star size={10} weight="fill" />
                                Best: {DAYS[best.day]} {formatHour(best.hour)} (~{best.avg}min)
                            </div>
                        )}
                        {worst && worst.avg > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: "rgba(239,68,68,0.1)", color: "var(--status-congested)" }}>
                                <Warning size={10} weight="fill" />
                                Worst: {DAYS[worst.day]} {formatHour(worst.hour)} (~{worst.avg}min)
                            </div>
                        )}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                        <div className="min-w-[480px]">
                            {/* Hour labels */}
                            <div className="flex ml-8 mb-1">
                                {DISPLAY_HOURS.map((h) => (
                                    <div key={h} className="flex-1 text-center text-[8px] font-bold"
                                        style={{ color: "var(--muted-foreground)" }}>
                                        {h % 3 === 0 ? formatHour(h) : ""}
                                    </div>
                                ))}
                            </div>

                            {/* Grid rows */}
                            {DAYS.map((dayLabel, dayIdx) => (
                                <div key={dayIdx} className="flex items-center gap-1 mb-0.5">
                                    <span className="w-7 text-[9px] font-bold text-right"
                                        style={{ color: dayIdx === currentDay ? "var(--primary)" : "var(--muted-foreground)" }}>
                                        {dayLabel}
                                    </span>
                                    <div className="flex flex-1 gap-px">
                                        {DISPLAY_HOURS.map((hour) => {
                                            const slot = getSlot(dayIdx, hour);
                                            const avg = slot?.avg || 0;
                                            const isNow = dayIdx === currentDay && hour === currentHour;

                                            return (
                                                <div
                                                    key={hour}
                                                    className="flex-1 rounded-sm relative"
                                                    style={{
                                                        background: getColor(avg),
                                                        height: "18px",
                                                        outline: isNow ? "2px solid var(--primary)" : "none",
                                                        outlineOffset: "-1px",
                                                    }}
                                                    title={`${dayLabel} ${formatHour(hour)}: ~${avg} min`}
                                                >
                                                    {isNow && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="h-1 w-1 rounded-full bg-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 pt-1">
                        {[
                            { label: "< 15m", color: "rgba(16,185,129,0.6)" },
                            { label: "15-30m", color: "rgba(245,158,11,0.5)" },
                            { label: "30-45m", color: "rgba(249,115,22,0.6)" },
                            { label: "45m+", color: "rgba(239,68,68,0.7)" },
                        ].map(({ label, color }) => (
                            <div key={label} className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-sm" style={{ background: color }} />
                                <span className="text-[8px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
};
