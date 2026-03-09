"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Broadcast } from "@phosphor-icons/react";

interface TrafficEntry {
    time: string;
    status: "smooth" | "moderate" | "congested";
    lastUpdated: string;
    speed?: number;
    freeFlowSpeed?: number;
}

interface QueueMapProps {
    trafficData: Record<string, TrafficEntry> | null;
}

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "";

const BORDER_MARKERS: { name: string; coords: [number, number]; directions: string[] }[] = [
    { name: "Sungai Tujuh", coords: [4.5878, 114.0753], directions: ["Brunei ➔ Miri", "Miri ➔ Brunei"] },
    { name: "Kuala Lurah", coords: [4.7407, 114.8135], directions: ["Brunei ➔ Kuala Lurah", "Kuala Lurah ➔ Brunei"] },
    { name: "Ujung Jalan", coords: [4.6890, 115.0393], directions: ["Brunei ➔ Pandaruan", "Pandaruan ➔ Brunei"] },
    { name: "Mengkalap", coords: [4.7933, 115.2363], directions: ["Brunei ➔ Lawas", "Lawas ➔ Brunei"] },
];

const STATUS_COLORS = {
    smooth: "#10b981",
    moderate: "#f59e0b",
    congested: "#ef4444",
};

function getWorstStatus(directions: string[], data: Record<string, TrafficEntry> | null): {
    status: "smooth" | "moderate" | "congested";
    worstTime: string;
} {
    if (!data) return { status: "smooth", worstTime: "---" };

    let worst: "smooth" | "moderate" | "congested" = "smooth";
    let worstTime = "---";
    const priority = { smooth: 0, moderate: 1, congested: 2 };

    for (const dir of directions) {
        const entry = data[dir];
        if (entry && priority[entry.status] > priority[worst]) {
            worst = entry.status;
            worstTime = entry.time;
        } else if (entry && entry.time !== "---") {
            worstTime = entry.time;
        }
    }
    return { status: worst, worstTime };
}

export default function QueueMap({ trafficData }: QueueMapProps) {
    const [mounted, setMounted] = useState(false);
    const [showTraffic, setShowTraffic] = useState(true);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setMounted(true);
        // Detect initial theme
        setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
        // Watch for theme changes
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    if (!mounted) return <div className="h-[400px] w-full skeleton rounded-2xl" />;

    return (
        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-border clean-card">
            <MapContainer
                center={[4.72, 114.85]}
                zoom={9}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                {/* Base map — theme-aware */}
                <TileLayer
                    key={isDark ? "dark" : "light"}
                    url={isDark
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* TomTom Traffic Flow overlay */}
                {showTraffic && TOMTOM_KEY && (
                    <TileLayer
                        url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_KEY}&tileSize=256&thickness=6`}
                        opacity={0.75}
                        zIndex={10}
                    />
                )}

                {BORDER_MARKERS.map((border) => {
                    const { status } = getWorstStatus(border.directions, trafficData);
                    const color = STATUS_COLORS[status];
                    const radius = status === "congested" ? 16 : status === "moderate" ? 13 : 10;

                    return (
                        <CircleMarker
                            key={border.name}
                            center={border.coords}
                            radius={radius}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.35,
                                weight: 2,
                            }}
                        >
                            <Popup>
                                <div style={{ fontFamily: "system-ui", minWidth: 160 }}>
                                    <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 6px", color: "#0f172a" }}>
                                        {border.name}
                                    </p>
                                    {border.directions.map((dir) => {
                                        const entry = trafficData?.[dir];
                                        const s = entry?.status || "smooth";
                                        const t = entry?.time || "---";
                                        return (
                                            <div key={dir} style={{
                                                display: "flex", justifyContent: "space-between",
                                                alignItems: "center", padding: "3px 0",
                                                fontSize: 11, color: "#475569"
                                            }}>
                                                <span>{dir.split("➔")[0].trim()} →</span>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: STATUS_COLORS[s as keyof typeof STATUS_COLORS],
                                                    fontSize: 12,
                                                }}>
                                                    {t === "---" ? "---" : `~${t} min`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 6 }}>
                                        {trafficData ? `Updated: ${Object.values(trafficData)[0]?.lastUpdated || "---"}` : "Loading..."}
                                    </p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* ── Traffic Toggle Button ── */}
            <button
                onClick={() => setShowTraffic(!showTraffic)}
                className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                    background: showTraffic
                        ? "linear-gradient(135deg, rgba(16,185,129,0.85), rgba(59,130,246,0.85))"
                        : "rgba(30,41,59,0.85)",
                    color: "#fff",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
                title={showTraffic ? "Hide traffic layer" : "Show traffic layer"}
            >
                <Broadcast size={14} weight="fill" />
                {showTraffic ? "Traffic ON" : "Traffic OFF"}
            </button>

            {/* ── Legend ── */}
            {showTraffic && (
                <div
                    className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1 px-3 py-2 rounded-lg text-[10px]"
                    style={{
                        background: "rgba(15,23,42,0.85)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#cbd5e1",
                    }}
                >
                    <span className="font-semibold text-[11px] text-white mb-0.5">Live Traffic</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full" style={{ background: "#10b981" }} />
                        Free flow
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full" style={{ background: "#f59e0b" }} />
                        Moderate
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full" style={{ background: "#ef4444" }} />
                        Congested
                    </div>
                </div>
            )}
        </div>
    );
}
