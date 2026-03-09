"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Car,
    CheckCircle,
    Clock,
    PaperPlaneTilt,
    X,
} from "@phosphor-icons/react";

const CROSSING_BORDERS = [
    "Sungai Tujuh (Brunei → Miri)",
    "Sungai Tujuh (Miri → Brunei)",
    "Kuala Lurah (Brunei → Kuala Lurah)",
    "Kuala Lurah (Kuala Lurah → Brunei)",
    "Ujung Jalan (Brunei → Pandaruan)",
    "Ujung Jalan (Pandaruan → Brunei)",
    "Mengkalap (Brunei → Lawas)",
    "Mengkalap (Lawas → Brunei)",
];

const WAIT_OPTIONS = [
    "< 5 min",
    "5-15 min",
    "15-30 min",
    "30-60 min",
    "> 1 hour",
];

interface CrossingReportData {
    border: string;
    waitTime: string;
    note: string;
    timestamp: number;
}

export const CrossingReport = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBorder, setSelectedBorder] = useState("");
    const [selectedWait, setSelectedWait] = useState("");
    const [note, setNote] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [recentReports, setRecentReports] = useState<CrossingReportData[]>([]);

    // Fetch recent reports from API on mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("/api/crossing");
                const json = await res.json();
                if (json.success && json.reports) {
                    const mapped: CrossingReportData[] = json.reports.map((r: any) => ({
                        border: r.border,
                        waitTime: r.waitTime,
                        note: r.note || "",
                        timestamp: new Date(r.createdAt).getTime(),
                    }));
                    setRecentReports(mapped.slice(0, 5));
                }
            } catch { /* silent */ }
        };
        fetchReports();
    }, []);

    const handleSubmit = async () => {
        if (!selectedBorder || !selectedWait) return;

        const report: CrossingReportData = {
            border: selectedBorder,
            waitTime: selectedWait,
            note: note.trim(),
            timestamp: Date.now(),
        };

        // Optimistic UI update
        setRecentReports((prev) => [report, ...prev].slice(0, 5));
        setSubmitted(true);

        // Persist to DB via API
        try {
            await fetch("/api/crossing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    border: selectedBorder,
                    waitTime: selectedWait,
                    note: note.trim() || undefined,
                }),
            });
        } catch { /* silent */ }

        // Also post to community chat
        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: "Traveler",
                    message: `🚗 Just crossed ${selectedBorder} — waited ${selectedWait}${note ? `. ${note}` : ""}`,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }),
            });
        } catch { /* silent */ }

        setTimeout(() => {
            setSubmitted(false);
            setIsOpen(false);
            setSelectedBorder("");
            setSelectedWait("");
            setNote("");
        }, 2000);
    };

    const formatTime = (ts: number) => {
        const mins = Math.floor((Date.now() - ts) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <div className="space-y-3">
            {/* Trigger Button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full clean-card p-4 text-left"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--secondary-subtle)" }}>
                            <Car size={20} weight="fill" style={{ color: "var(--secondary)" }} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">I Just Crossed! 🚗</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                Share your crossing experience
                            </p>
                        </div>
                    </div>
                    <PaperPlaneTilt size={18} weight="fill" style={{ color: "var(--secondary)" }} />
                </div>
            </motion.button>

            {/* Report Form */}
            <AnimatePresence>
                {isOpen && !submitted && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="clean-card overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            {/* Close */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold">Report Your Crossing</p>
                                <button onClick={() => setIsOpen(false)} className="haptic-btn p-1">
                                    <X size={18} style={{ color: "var(--muted-foreground)" }} />
                                </button>
                            </div>

                            {/* Border Selector */}
                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                                    Which crossing?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {CROSSING_BORDERS.map((b) => (
                                        <button key={b}
                                            onClick={() => setSelectedBorder(b)}
                                            className={`filter-pill haptic-btn text-[11px] ${selectedBorder === b ? "active" : ""}`}
                                        >
                                            {b.split("(")[0].trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wait Time */}
                            {selectedBorder && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                                        How long did you wait?
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {WAIT_OPTIONS.map((w) => (
                                            <button key={w}
                                                onClick={() => setSelectedWait(w)}
                                                className={`filter-pill haptic-btn text-[11px] ${selectedWait === w ? "active" : ""}`}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Note */}
                            {selectedWait && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Any notes? (optional)"
                                        className="native-input text-sm"
                                        maxLength={100}
                                    />
                                </motion.div>
                            )}

                            {/* Submit */}
                            {selectedWait && (
                                <motion.button
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleSubmit}
                                    className="btn-primary haptic-btn w-full flex items-center justify-center gap-2"
                                >
                                    <PaperPlaneTilt size={16} weight="fill" />
                                    Submit Report
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Success */}
                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="clean-card p-5 text-center"
                    >
                        <CheckCircle size={40} weight="fill" style={{ color: "var(--status-smooth)" }} />
                        <p className="text-sm font-bold mt-2">Thank you! Report submitted 🙏</p>
                        <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                            Your report helps fellow travelers
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Reports */}
            {recentReports.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider px-1"
                        style={{ color: "var(--muted-foreground)" }}>
                        Recent Reports
                    </p>
                    {recentReports.map((r, i) => (
                        <div key={i} className="clean-card p-3 flex items-center gap-3">
                            <Car size={16} weight="fill" style={{ color: "var(--secondary)" }} />
                            <div className="flex-1">
                                <p className="text-xs font-semibold">{r.border.split("(")[0].trim()}</p>
                                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                                    Waited {r.waitTime} · {formatTime(r.timestamp)}
                                    {r.note && ` · "${r.note}"`}
                                </p>
                            </div>
                            <Clock size={12} style={{ color: "var(--muted-foreground)" }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
