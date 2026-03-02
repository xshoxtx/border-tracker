"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    CloudRain,
    ThermometerSimple,
    Drop,
    Wind,
    Warning,
    Eye,
} from "@phosphor-icons/react";

interface WeatherData {
    temp: number;
    feelsLike: number;
    humidity: number;
    description: string;
    emoji: string;
    wind: number;
    visibility: number;
    high: number;
    low: number;
    rainChance: number;
    rainWarning: boolean;
}

const BORDERS = [
    { id: "sungai-tujuh", label: "Sungai Tujuh" },
    { id: "kuala-lurah", label: "Kuala Lurah" },
    { id: "ujung-jalan", label: "Ujung Jalan" },
    { id: "mengkalap", label: "Mengkalap" },
];

export const BorderWeather = () => {
    const [selected, setSelected] = useState("sungai-tujuh");
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetch(`/api/weather?border=${selected}`)
            .then((r) => r.json())
            .then((json) => {
                if (!cancelled && json.success) setData(json.weather);
            })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [selected]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="clean-card overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                    <CloudRain size={16} weight="fill" style={{ color: "var(--primary)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--muted-foreground)" }}>
                        Border Weather
                    </span>
                </div>
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="text-[11px] font-bold rounded-lg px-2 py-1"
                    style={{
                        background: "var(--muted)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                    }}
                >
                    {BORDERS.map((b) => (
                        <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                </select>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        <div className="skeleton h-12 w-32" />
                        <div className="skeleton h-4 w-48" />
                    </div>
                ) : data ? (
                    <div className="space-y-4">
                        {/* Main temp */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-4xl">{data.emoji}</span>
                                    <span className="text-3xl font-extrabold">{data.temp}°C</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                                    {data.description} · Feels like {data.feelsLike}°C
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold">H: {data.high}° L: {data.low}°</p>
                            </div>
                        </div>

                        {/* Rain Warning */}
                        {data.rainWarning && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{
                                    background: "rgba(59, 130, 246, 0.08)",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                }}>
                                <Warning size={16} weight="fill" style={{ color: "var(--primary)" }} />
                                <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
                                    🌧️ {data.rainChance}% chance of rain — bring umbrella!
                                </span>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-2 rounded-xl" style={{ background: "var(--muted)" }}>
                                <Drop size={14} weight="fill" style={{ color: "var(--primary)", margin: "0 auto 4px" }} />
                                <p className="text-xs font-bold">{data.humidity}%</p>
                                <p className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Humidity</p>
                            </div>
                            <div className="text-center p-2 rounded-xl" style={{ background: "var(--muted)" }}>
                                <Wind size={14} weight="fill" style={{ color: "var(--secondary)", margin: "0 auto 4px" }} />
                                <p className="text-xs font-bold">{data.wind} km/h</p>
                                <p className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Wind</p>
                            </div>
                            <div className="text-center p-2 rounded-xl" style={{ background: "var(--muted)" }}>
                                <Eye size={14} weight="fill" style={{ color: "var(--status-smooth)", margin: "0 auto 4px" }} />
                                <p className="text-xs font-bold">{data.visibility} km</p>
                                <p className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Visibility</p>
                            </div>
                        </div>

                        {/* Rain Chance Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                                    Rain Chance Today
                                </span>
                                <span className="text-[10px] font-extrabold">{data.rainChance}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${data.rainChance}%`,
                                        background: data.rainChance >= 60
                                            ? "var(--primary)"
                                            : data.rainChance >= 30
                                                ? "var(--status-moderate)"
                                                : "var(--status-smooth)",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-center py-4" style={{ color: "var(--muted-foreground)" }}>
                        Unable to load weather data
                    </p>
                )}
            </div>
        </motion.div>
    );
};
