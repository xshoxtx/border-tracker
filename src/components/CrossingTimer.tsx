"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer,
    Play,
    Stop,
    ArrowCounterClockwise,
    MapPin,
    CheckCircle,
    Clock,
} from "@phosphor-icons/react";

const BORDERS = ["Sungai Tujuh", "Kuala Lurah", "Ujung Jalan", "Mengkalap"];

interface TimerState {
    border: string;
    startTime: number;
    running: boolean;
    elapsed: number; // ms
}

const STORAGE_KEY = "crossing_timer";

const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export const CrossingTimer = () => {
    const [timer, setTimer] = useState<TimerState | null>(null);
    const [selectedBorder, setSelectedBorder] = useState(BORDERS[0]);
    const [saved, setSaved] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed: TimerState = JSON.parse(saved);
                if (parsed.running) {
                    parsed.elapsed = Date.now() - parsed.startTime;
                }
                setTimer(parsed);
                setSelectedBorder(parsed.border);
                setExpanded(true);
            }
        }
    }, []);

    // Tick interval
    useEffect(() => {
        if (timer?.running) {
            intervalRef.current = setInterval(() => {
                setTimer(prev => prev ? {
                    ...prev,
                    elapsed: Date.now() - prev.startTime,
                } : null);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [timer?.running]);

    // Persist to localStorage
    useEffect(() => {
        if (timer) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [timer]);

    const handleStart = useCallback(() => {
        const now = Date.now();
        setTimer({
            border: selectedBorder,
            startTime: now,
            running: true,
            elapsed: 0,
        });
        setSaved(false);
        setExpanded(true);
    }, [selectedBorder]);

    const handleStop = useCallback(() => {
        setTimer(prev => prev ? { ...prev, running: false } : null);
    }, []);

    const handleReset = useCallback(() => {
        setTimer(null);
        setSaved(false);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const handleSave = async () => {
        if (!timer) return;
        const waitMin = Math.round(timer.elapsed / 60000);
        try {
            await fetch("/api/crossing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    border: timer.border,
                    waitMinutes: Math.max(waitMin, 1),
                    notes: `Timer: ${formatTime(timer.elapsed)} actual wait`,
                }),
            });
            setSaved(true);
        } catch {
            // Silently fail
        }
    };

    const isRunning = timer?.running;
    const isStopped = timer && !timer.running && timer.elapsed > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="clean-card overflow-hidden"
        >
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3.5 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: isRunning ? "rgba(239, 68, 68, 0.1)" : "var(--primary-subtle)",
                        }}>
                        <Timer
                            size={20}
                            weight="fill"
                            style={{ color: isRunning ? "#ef4444" : "var(--primary)" }}
                            className={isRunning ? "animate-pulse" : ""}
                        />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold">Crossing Timer</p>
                        <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                            {isRunning
                                ? `⏱️ ${formatTime(timer!.elapsed)} — ${timer!.border}`
                                : isStopped
                                    ? `✅ ${formatTime(timer!.elapsed)} at ${timer!.border}`
                                    : "Track your actual wait time"}
                        </p>
                    </div>
                </div>

                {isRunning && (
                    <span className="text-lg font-extrabold tabular-nums" style={{ color: "#ef4444" }}>
                        {formatTime(timer!.elapsed)}
                    </span>
                )}
            </button>

            {/* Expandable content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>

                            {/* Timer display */}
                            <div className="pt-4 text-center">
                                <p className="text-5xl font-black tabular-nums tracking-tight"
                                    style={{
                                        color: isRunning ? "#ef4444" : isStopped ? "var(--status-smooth)" : "var(--foreground)",
                                    }}>
                                    {timer ? formatTime(timer.elapsed) : "00:00"}
                                </p>
                                <p className="text-[10px] mt-1 font-semibold uppercase tracking-wider"
                                    style={{ color: "var(--muted-foreground)" }}>
                                    {isRunning ? "Timer running..." : isStopped ? "Crossing complete" : "Ready to start"}
                                </p>
                            </div>

                            {/* Border picker — only when idle */}
                            {!isRunning && !isStopped && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
                                        style={{ color: "var(--muted-foreground)" }}>
                                        <MapPin size={10} weight="fill" className="inline mr-1" />
                                        Select Border
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                                        {BORDERS.map(b => (
                                            <button
                                                key={b}
                                                onClick={() => setSelectedBorder(b)}
                                                className={`filter-pill haptic-btn flex-shrink-0 ${selectedBorder === b ? "active" : ""}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex gap-2">
                                {!isRunning && !isStopped && (
                                    <button
                                        onClick={handleStart}
                                        className="haptic-btn btn-primary text-xs px-4 py-2.5 flex-1 rounded-xl font-bold"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Play size={14} weight="fill" />
                                            Start Timer
                                        </span>
                                    </button>
                                )}

                                {isRunning && (
                                    <button
                                        onClick={handleStop}
                                        className="haptic-btn text-xs px-4 py-2.5 flex-1 rounded-xl font-bold"
                                        style={{
                                            background: "rgba(239, 68, 68, 0.1)",
                                            color: "#ef4444",
                                            border: "1px solid rgba(239, 68, 68, 0.2)",
                                        }}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Stop size={14} weight="fill" />
                                            Stop — I Crossed!
                                        </span>
                                    </button>
                                )}

                                {isStopped && (
                                    <>
                                        {!saved ? (
                                            <button
                                                onClick={handleSave}
                                                className="haptic-btn btn-primary text-xs px-4 py-2.5 flex-1 rounded-xl font-bold"
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    <CheckCircle size={14} weight="fill" />
                                                    Save Crossing Time
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 flex-1 py-2.5 text-xs font-bold"
                                                style={{ color: "var(--status-smooth)" }}>
                                                <CheckCircle size={14} weight="fill" />
                                                Saved! Thanks for sharing ✓
                                            </div>
                                        )}
                                        <button
                                            onClick={handleReset}
                                            className="haptic-btn h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: "var(--muted)" }}
                                        >
                                            <ArrowCounterClockwise size={16} weight="bold" style={{ color: "var(--muted-foreground)" }} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Info text */}
                            <p className="text-[10px] text-center" style={{ color: "var(--muted-foreground)" }}>
                                <Clock size={10} weight="bold" className="inline mr-1" />
                                {isRunning
                                    ? "Timer persists even if you close the app"
                                    : "Start when you join the queue, stop when you cross"}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
