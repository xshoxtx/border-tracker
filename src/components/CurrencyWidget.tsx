"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowsLeftRight, ArrowClockwise, TrendUp } from "@phosphor-icons/react";

interface CurrencyWidgetProps {
    from: string;
    to: string;
}

export const CurrencyWidget = ({ from: initialFrom, to: initialTo }: CurrencyWidgetProps) => {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchRate = async () => {
        setLoading(true); setError(false);
        try {
            const res = await fetch(`/api/currency?from=${from}&to=${to}`, {
                cache: 'no-store',
            });
            const data = await res.json();
            if (data.rate) {
                setRate(data.rate);
                setError(data.fallback === true);
            } else {
                setError(true);
            }
        } catch { setError(true); }
        finally { setLoading(false); }
    };

    const handleSwap = () => {
        const temp = from; setFrom(to); setTo(temp);
    };

    useEffect(() => { fetchRate(); }, [from, to]);

    const fallback = from === "BND" ? "3.08" : "0.325";

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-5 overflow-hidden relative">
            {/* Accent glow */}
            <div className="absolute top-0 right-0 w-40 h-40 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(255,130,76,0.08)" }} />

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl flex items-center justify-center"
                        style={{ background: "var(--secondary-subtle)" }}>
                        <TrendUp size={18} weight="fill" color="var(--secondary)" />
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight">Live Exchange</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5"
                            style={{ color: "var(--muted-foreground)" }}>Real-time rate</p>
                    </div>
                </div>

                <div className="flex gap-1.5">
                    <button onClick={handleSwap}
                        className="haptic-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                        <ArrowsLeftRight size={11} weight="bold" /> Swap
                    </button>
                    <button onClick={fetchRate} disabled={loading}
                        className="haptic-btn p-2 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--muted)" }}>
                        <ArrowClockwise size={14} weight="bold"
                            color="var(--muted-foreground)"
                            className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Rate display */}
            <div className="flex items-end gap-3 py-2">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: "var(--muted-foreground)" }}>1 {from} =</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tight tabular-nums"
                            style={{ color: "var(--secondary)" }}>
                            {loading ? "···" : error ? fallback : rate?.toFixed(4)}
                        </span>
                        <span className="text-base font-bold" style={{ color: "var(--muted-foreground)" }}>{to}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3"
                style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-[8px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}>
                    {error ? "Fallback rate" : "Verified · open.er-api.com"}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}>Updated Live</span>
            </div>
        </motion.div>
    );
};
