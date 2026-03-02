"use client";

import { useState, useCallback } from "react";

interface GeoPosition {
    lat: number;
    lng: number;
}

interface UseGeolocationReturn {
    position: GeoPosition | null;
    loading: boolean;
    error: string | null;
    requestLocation: () => void;
    denied: boolean;
}

export function useGeolocation(): UseGeolocationReturn {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [denied, setDenied] = useState(false);

    const requestLocation = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported by your browser");
            return;
        }

        setLoading(true);
        setError(null);
        setDenied(false);

        const onSuccess = (pos: GeolocationPosition) => {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLoading(false);
            setDenied(false);
        };

        const tryWithLowAccuracy = () => {
            navigator.geolocation.getCurrentPosition(
                onSuccess,
                (err2) => {
                    // Final failure — show user-friendly error
                    if (err2.code === err2.PERMISSION_DENIED) {
                        setDenied(true);
                        setError("Location access denied — please enable in browser Settings");
                    } else if (err2.code === err2.POSITION_UNAVAILABLE) {
                        setError("GPS unavailable — make sure Location/GPS is turned on");
                    } else {
                        setError("GPS timeout — try again in an open area");
                    }
                    setLoading(false);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 600000, // 10 min cache
                }
            );
        };

        // First try: high accuracy (works well on most devices)
        navigator.geolocation.getCurrentPosition(
            onSuccess,
            (err) => {
                // If high accuracy fails, auto-retry with low accuracy
                // This is common on Android where high accuracy requires Google Play Services
                if (err.code === err.PERMISSION_DENIED) {
                    setDenied(true);
                    setError("Location access denied — please enable in browser Settings");
                    setLoading(false);
                } else {
                    // Auto-retry with low accuracy (network-based)
                    tryWithLowAccuracy();
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 min cache
            }
        );
    }, []);

    return { position, loading, error, requestLocation, denied };
}

// ─── Border Coordinates ───
export const BORDER_COORDS: Record<string, { lat: number; lng: number; name: string; shortName: string }> = {
    "Sungai Tujuh": { lat: 4.5852, lng: 114.0723, name: "CIQ Sungai Tujuh", shortName: "STJ" },
    "Kuala Lurah": { lat: 4.7407, lng: 114.8135, name: "CIQ Kuala Lurah", shortName: "KLR" },
    "Ujung Jalan": { lat: 4.6890, lng: 115.0393, name: "CIQ Ujung Jalan", shortName: "UJJ" },
    "Mengkalap": { lat: 4.7933, lng: 115.2363, name: "CIQ Mengkalap", shortName: "MKP" },
};

// ─── Haversine Distance (km) ───
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ─── Get Nearest Border ───
export function getNearestBorder(lat: number, lng: number) {
    let nearest = { name: "", shortName: "", distance: Infinity };
    Object.entries(BORDER_COORDS).forEach(([key, coords]) => {
        const dist = getDistanceKm(lat, lng, coords.lat, coords.lng);
        if (dist < nearest.distance) {
            nearest = { name: key, shortName: coords.shortName, distance: dist };
        }
    });
    return nearest;
}

// ─── Estimate Drive Time (25km/h avg in border area) ───
export function estimateDriveTime(distanceKm: number): string {
    const mins = Math.round((distanceKm / 25) * 60);
    if (mins < 1) return "< 1 min";
    if (mins < 60) return `~${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `~${hrs}h ${rem}m`;
}
