"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Star, Diamond } from "@phosphor-icons/react";

interface ContributorEntry {
    nickname: string;
    crossings: number;
    snaps: number;
    total: number;
    badge: string;
}

const BADGE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    diamond: { icon: Diamond, color: "#a78bfa", label: "Diamond" },
    gold: { icon: Crown, color: "#fbbf24", label: "Gold" },
    silver: { icon: Medal, color: "#94a3b8", label: "Silver" },
    bronze: { icon: Medal, color: "#d97706", label: "Bronze" },
    none: { icon: Star, color: "var(--muted-foreground)", label: "" },
};

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

export const Leaderboard = () => {
    const [leaders, setLeaders] = useState<ContributorEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myNickname, setMyNickname] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("chat_nickname");
        if (saved) setMyNickname(saved);
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch("/api/leaderboard");
            const json = await res.json();
            if (json.success) setLeaders(json.leaderboard);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div className="clean-card p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-5 w-32 skeleton rounded" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 skeleton rounded-xl mb-2" />
                ))}
            </div>
        );
    }

    return (
        <div className="clean-card overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(251, 191, 36, 0.1)" }}>
                    <Trophy size={20} weight="fill" style={{ color: "#fbbf24" }} />
                </div>
                <div>
                    <p className="text-sm font-bold">Leaderboard 🏆</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        Top contributors this week
                    </p>
                </div>
            </div>

            {/* List */}
            {leaders.length === 0 ? (
                <div className="px-4 pb-5 text-center">
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        No data yet — be the first to contribute! 💪
                    </p>
                </div>
            ) : (
                <div className="px-3 pb-3 space-y-1.5">
                    <AnimatePresence>
                        {leaders.map((entry, i) => {
                            const badge = BADGE_CONFIG[entry.badge] || BADGE_CONFIG.none;
                            const BadgeIcon = badge.icon;
                            const isMe = entry.nickname === myNickname;

                            return (
                                <motion.div
                                    key={entry.nickname}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{
                                        background: isMe ? "var(--primary-subtle)" : "var(--surface-2)",
                                        border: isMe ? "1px solid var(--primary)" : "1px solid transparent",
                                    }}
                                >
                                    {/* Rank */}
                                    <div className="w-8 text-center flex-shrink-0">
                                        {i < 3 ? (
                                            <span className="text-lg">{RANK_EMOJI[i]}</span>
                                        ) : (
                                            <span className="text-xs font-black" style={{ color: "var(--muted-foreground)" }}>
                                                #{i + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold truncate">
                                                {entry.nickname}
                                                {isMe && <span className="text-[9px] font-semibold ml-1" style={{ color: "var(--primary)" }}>(You)</span>}
                                            </p>
                                            {entry.badge !== "none" && (
                                                <BadgeIcon size={14} weight="fill" style={{ color: badge.color }} />
                                            )}
                                        </div>
                                        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                                            {entry.snaps > 0 && `${entry.snaps} snaps`}
                                            {entry.snaps > 0 && entry.crossings > 0 && " · "}
                                            {entry.crossings > 0 && `${entry.crossings} reports`}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-sm font-black" style={{ color: i < 3 ? "var(--primary)" : "var(--foreground)" }}>
                                            {entry.total}
                                        </p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest"
                                            style={{ color: "var(--muted-foreground)" }}>
                                            pts
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
