"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

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

const BORDER_MARKERS: { name: string; coords: [number, number]; directions: string[] }[] = [
    { name: "Sungai Tujuh", coords: [4.5878, 114.0753], directions: ["Brunei ➔ Miri", "Miri ➔ Brunei"] },
    { name: "Kuala Lurah", coords: [4.7407, 114.8135], directions: ["Brunei ➔ Tedungan", "Tedungan ➔ Brunei"] },
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

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[400px] w-full skeleton rounded-2xl" />;

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border clean-card">
            <MapContainer
                center={[4.72, 114.85]}
                zoom={9}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {BORDER_MARKERS.map((border) => {
                    const { status, worstTime } = getWorstStatus(border.directions, trafficData);
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
        </div>
    );
}
