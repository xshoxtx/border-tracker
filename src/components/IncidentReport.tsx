"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Warning,
    TrafficCone,
    CheckCircle,
    PaperPlaneTilt,
    X,
    ShieldWarning,
    Prohibit,
    ArrowsCounterClockwise,
    Info,
    MapPin,
    XCircle,
} from "@phosphor-icons/react";
import { useGeolocation, getNearestBorder } from "@/hooks/useGeolocation";

const CROSSING_BORDERS = [
    "Sungai Tujuh",
    "Kuala Lurah",
    "Ujung Jalan",
    "Mengkalap",
];

const INCIDENT_TYPES = [
    { id: "system_down", label: "System Down", emoji: "🔴", icon: Prohibit },
    { id: "extra_counters", label: "Extra Counters", emoji: "🟢", icon: ArrowsCounterClockwise },
    { id: "road_closure", label: "Road Closure", emoji: "🚧", icon: TrafficCone },
    { id: "other", label: "Lain-lain", emoji: "⚠️", icon: Info },
];

interface IncidentData {
    id: number;
    border: string;
    type: string;
    note: string | null;
    nickname: string;
    createdAt: string;
}

export const IncidentReport = () => {
    const [incidents, setIncidents] = useState<IncidentData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBorder, setSelectedBorder] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
    const { position, requestLocation } = useGeolocation();

    useEffect(() => {
        fetchIncidents();
        // Load dismissed IDs from localStorage
        try {
            const saved = localStorage.getItem("dismissed_incidents");
            if (saved) setDismissedIds(new Set(JSON.parse(saved)));
        } catch { /* silent */ }
    }, []);

    // Auto-detect border from GPS
    useEffect(() => {
        if (position) {
            const nearest = getNearestBorder(position.lat, position.lng);
            if (nearest && nearest.distance < 10) {
                setSelectedBorder(nearest.name);
            }
        }
    }, [position]);

    const fetchIncidents = async () => {
        try {
            const res = await fetch("/api/incidents");
            const json = await res.json();
            if (json.success) setIncidents(json.incidents);
        } catch { /* silent */ }
    };

    const handleSubmit = async () => {
        if (!selectedBorder || !selectedType) return;
        setSubmitting(true);
        setError(null);

        const nickname = localStorage.getItem("chat_nickname") || "Traveler";

        // Require GPS
        if (!position) {
            setError("GPS location required — please enable Location access");
            requestLocation();
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    border: selectedBorder,
                    type: selectedType,
                    note: note.trim() || undefined,
                    nickname,
                    lat: position.lat,
                    lng: position.lng,
                }),
            });
            const json = await res.json();
            if (json.success) {
                setSubmitted(true);
                fetchIncidents();

                // Also post to community chat
                const typeInfo = INCIDENT_TYPES.find((t) => t.id === selectedType);
                try {
                    await fetch("/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user: nickname,
                            message: `${typeInfo?.emoji} ${typeInfo?.label} at ${selectedBorder}${note.trim() ? `: ${note.trim()}` : ""}`,
                            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        }),
                    });
                } catch { /* silent */ }

                setTimeout(() => {
                    setSubmitted(false);
                    setIsOpen(false);
                    setSelectedBorder("");
                    setSelectedType("");
                    setNote("");
                }, 2000);
            } else {
                setError(json.error || "Gagal hantar laporan");
            }
        } catch {
            setError("Connection error");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return "baru";
        if (mins < 60) return `${mins}m lalu`;
        return `${Math.floor(mins / 60)}j lalu`;
    };

    const getTypeInfo = (typeId: string) => INCIDENT_TYPES.find((t) => t.id === typeId) || INCIDENT_TYPES[3];

    const handleDismiss = async (incidentId: number) => {
        if (dismissedIds.has(incidentId)) return;
        try {
            const res = await fetch("/api/incidents", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ incidentId }),
            });
            const json = await res.json();
            if (json.success) {
                const newDismissed = new Set(dismissedIds);
                newDismissed.add(incidentId);
                setDismissedIds(newDismissed);
                localStorage.setItem("dismissed_incidents", JSON.stringify([...newDismissed]));
                if (json.resolved) {
                    setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
                }
            }
        } catch { /* silent */ }
    };

    return (
        <div className="space-y-3">
            {/* Active Incidents Banner */}
            {incidents.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider px-1"
                        style={{ color: "var(--status-congested)" }}>
                        ⚠️ Active Incidents
                    </p>
                    {incidents.slice(0, 3).map((inc) => {
                        const typeInfo = getTypeInfo(inc.type);
                        return (
                            <motion.div
                                key={inc.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="incident-banner p-3 rounded-xl flex items-center gap-3"
                            >
                                <span className="text-lg flex-shrink-0">{typeInfo.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold">{typeInfo.label} — {inc.border}</p>
                                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                                        {inc.nickname} · {formatTime(inc.createdAt)}
                                        {inc.note && !inc.note.includes("__DISMISS__") && ` · "${inc.note}"`}
                                    </p>
                                </div>
                                {/* Dismiss button */}
                                {!dismissedIds.has(inc.id) && (
                                    <button
                                        onClick={() => handleDismiss(inc.id)}
                                        className="haptic-btn flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
                                        style={{ background: "rgba(239,68,68,0.1)" }}
                                        title="Dismiss fake report"
                                    >
                                        <XCircle size={14} weight="fill" style={{ color: "var(--status-congested)" }} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Report Button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full clean-card p-4 text-left"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                            <ShieldWarning size={20} weight="fill" style={{ color: "var(--status-congested)" }} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Report Incident 🚨</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                System down, road closure, dll.
                            </p>
                        </div>
                    </div>
                    <Warning size={18} weight="fill" style={{ color: "var(--status-congested)" }} />
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
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold">Lapor Insiden</p>
                                <button onClick={() => setIsOpen(false)} className="haptic-btn p-1">
                                    <X size={18} style={{ color: "var(--muted-foreground)" }} />
                                </button>
                            </div>

                            {/* Border */}
                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                                    Border mana?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {CROSSING_BORDERS.map((b) => (
                                        <button key={b}
                                            onClick={() => setSelectedBorder(b)}
                                            className={`filter-pill haptic-btn text-[11px] ${selectedBorder === b ? "active" : ""}`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Incident Type */}
                            {selectedBorder && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                                        Jenis insiden?
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {INCIDENT_TYPES.map((type) => {
                                            const TypeIcon = type.icon;
                                            return (
                                                <button key={type.id}
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={`clean-card p-3 text-left haptic-btn ${selectedType === type.id ? "ring-2" : ""}`}
                                                    style={{
                                                        borderColor: selectedType === type.id ? "var(--primary)" : undefined,
                                                        ...(selectedType === type.id ? { boxShadow: "0 0 0 2px var(--primary)" } : {}),
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{type.emoji}</span>
                                                        <span className="text-[11px] font-semibold">{type.label}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Note */}
                            {selectedType && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Maklumat tambahan? (optional)"
                                        className="native-input text-sm"
                                        maxLength={150}
                                    />
                                </motion.div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 text-[11px] font-semibold"
                                    style={{ color: "var(--status-congested)" }}>
                                    <Warning size={14} weight="fill" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            {selectedType && (
                                <motion.button
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-primary haptic-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span className="text-sm">Menghantar...</span>
                                    ) : (
                                        <>
                                            <PaperPlaneTilt size={16} weight="fill" />
                                            Hantar Laporan
                                        </>
                                    )}
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
                        <p className="text-sm font-bold mt-2">Laporan dihantar! 🚨</p>
                        <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                            Terima kasih, maklumat ini membantu traveler lain
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
