"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Prohibit,
    ArrowsCounterClockwise,
    TrafficCone,
    Info,
    XCircle,
} from "@phosphor-icons/react";

const INCIDENT_TYPES = [
    { id: "system_down", label: "System Down", emoji: "🔴", icon: Prohibit },
    { id: "extra_counters", label: "Extra Counters", emoji: "🟢", icon: ArrowsCounterClockwise },
    { id: "road_closure", label: "Road Closure", emoji: "🚧", icon: TrafficCone },
    { id: "other", label: "Other", emoji: "⚠️", icon: Info },
];

interface IncidentData {
    id: number;
    border: string;
    type: string;
    note: string | null;
    nickname: string;
    createdAt: string;
}

/**
 * Lightweight component that ONLY shows active incident banners.
 * Used at the top of every Community sub-tab for safety visibility.
 */
export const IncidentBanners = () => {
    const [incidents, setIncidents] = useState<IncidentData[]>([]);
    const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchIncidents();
        try {
            const saved = localStorage.getItem("dismissed_incidents");
            if (saved) setDismissedIds(new Set(JSON.parse(saved)));
        } catch { /* silent */ }

        // Poll every 30s for new incidents
        const interval = setInterval(fetchIncidents, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchIncidents = async () => {
        try {
            const res = await fetch("/api/incidents");
            const json = await res.json();
            if (json.success) setIncidents(json.incidents);
        } catch { /* silent */ }
    };

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

    const formatTime = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    const getTypeInfo = (typeId: string) =>
        INCIDENT_TYPES.find((t) => t.id === typeId) || INCIDENT_TYPES[3];

    if (incidents.length === 0) return null;

    return (
        <div className="space-y-2">
            {incidents.slice(0, 2).map((inc) => {
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
    );
};
