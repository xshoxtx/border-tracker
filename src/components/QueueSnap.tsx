"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    PaperPlaneTilt,
    Flag,
    X,
    MapPin,
    CheckCircle,
    Warning,
    Image as ImageIcon,
} from "@phosphor-icons/react";
import { useGeolocation, getNearestBorder } from "@/hooks/useGeolocation";

const SNAP_BORDERS = [
    "Sungai Tujuh",
    "Kuala Lurah",
    "Ujung Jalan",
    "Mengkalap",
];

interface SnapData {
    id: number;
    border: string;
    imageUrl: string;
    nickname: string;
    flags: number;
    createdAt: string;
}

// ─── Client-side image compression ───
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.7;
const TARGET_SIZE = 500 * 1024; // 500KB target

function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;

            // Resize if wider than MAX_WIDTH
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(file); return; }
            ctx.drawImage(img, 0, 0, width, height);

            // Try compression at decreasing quality
            let quality = JPEG_QUALITY;
            const tryCompress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) { resolve(file); return; }
                        // If still too big and quality can go lower
                        if (blob.size > TARGET_SIZE && quality > 0.3) {
                            quality -= 0.1;
                            tryCompress();
                            return;
                        }
                        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                            type: "image/jpeg",
                        });
                        resolve(compressed);
                    },
                    "image/jpeg",
                    quality
                );
            };
            tryCompress();
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

export const QueueSnap = () => {
    const [snaps, setSnaps] = useState<SnapData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBorder, setSelectedBorder] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [compressing, setCompressing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set());
    const fileRef = useRef<HTMLInputElement>(null);
    const { position, requestLocation } = useGeolocation();

    // Fetch snaps on mount
    useEffect(() => {
        fetchSnaps();
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

    // Load flagged IDs from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("flagged_snaps");
            if (saved) setFlaggedIds(new Set(JSON.parse(saved)));
        } catch { /* silent */ }
    }, []);

    const fetchSnaps = async () => {
        try {
            const res = await fetch("/api/snaps");
            const json = await res.json();
            if (json.success) setSnaps(json.snaps);
        } catch { /* silent */ }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setError(null);
        setCompressing(true);

        try {
            const compressed = await compressImage(f);
            setFile(compressed);
            setPreview(URL.createObjectURL(compressed));
        } catch {
            setError("Failed to process image");
        } finally {
            setCompressing(false);
        }
    };

    const handleSubmit = async () => {
        if (!file || !selectedBorder) return;
        setSubmitting(true);
        setError(null);

        const nickname = localStorage.getItem("chat_nickname") || "Traveler";
        const formData = new FormData();
        formData.append("image", file);
        formData.append("border", selectedBorder);
        formData.append("nickname", nickname);
        if (position) {
            formData.append("lat", position.lat.toString());
            formData.append("lng", position.lng.toString());
        }

        try {
            const res = await fetch("/api/snaps", { method: "POST", body: formData });
            const json = await res.json();
            if (json.success) {
                setSubmitted(true);
                fetchSnaps();
                setTimeout(() => {
                    setSubmitted(false);
                    setIsOpen(false);
                    setFile(null);
                    setPreview(null);
                    setSelectedBorder("");
                }, 2000);
            } else {
                setError(json.error || "Gagal hantar snap");
            }
        } catch {
            setError("Connection error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFlag = async (snapId: number) => {
        if (flaggedIds.has(snapId)) return;
        try {
            const res = await fetch("/api/snaps/flag", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ snapId }),
            });
            const json = await res.json();
            if (json.success) {
                const newFlagged = new Set(flaggedIds);
                newFlagged.add(snapId);
                setFlaggedIds(newFlagged);
                localStorage.setItem("flagged_snaps", JSON.stringify([...newFlagged]));
                if (json.hidden) {
                    setSnaps((prev) => prev.filter((s) => s.id !== snapId));
                }
            }
        } catch { /* silent */ }
    };

    const formatTime = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return "baru";
        if (mins < 60) return `${mins}m lalu`;
        return `${Math.floor(mins / 60)}j lalu`;
    };

    return (
        <div className="space-y-3">
            {/* Camera Button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!position) requestLocation();
                }}
                className="w-full clean-card p-4 text-left"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--primary-subtle)" }}>
                            <Camera size={20} weight="fill" style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Queue Snap 📸</p>
                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                Snap gambar queue sekarang
                            </p>
                        </div>
                    </div>
                    <Camera size={18} weight="fill" style={{ color: "var(--primary)" }} />
                </div>
            </motion.button>

            {/* Upload Form */}
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
                                <p className="text-sm font-bold">Ambil Gambar Queue</p>
                                <button onClick={() => setIsOpen(false)} className="haptic-btn p-1">
                                    <X size={18} style={{ color: "var(--muted-foreground)" }} />
                                </button>
                            </div>

                            {/* Camera Input */}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {!preview ? (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-3"
                                    style={{ background: "var(--surface-2)", border: "2px dashed var(--border)" }}
                                >
                                    <Camera size={40} weight="duotone" style={{ color: "var(--muted-foreground)" }} />
                                    <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                                        {compressing ? "Compressing..." : "Tap untuk buka kamera"}
                                    </p>
                                </motion.button>
                            ) : (
                                <div className="relative">
                                    <img src={preview} alt="Preview"
                                        className="w-full aspect-[4/3] object-cover rounded-2xl" />
                                    <button
                                        onClick={() => { setPreview(null); setFile(null); }}
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center"
                                        style={{ background: "rgba(0,0,0,0.6)" }}
                                    >
                                        <X size={16} color="white" />
                                    </button>
                                </div>
                            )}

                            {/* GPS Status */}
                            <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                <MapPin size={14} weight="fill" style={{ color: position ? "var(--status-smooth)" : "var(--muted-foreground)" }} />
                                {position ? "GPS locked ✅" : "Menunggu GPS..."}
                            </div>

                            {/* Border Selector */}
                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                                    Border mana?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {SNAP_BORDERS.map((b) => (
                                        <button key={b}
                                            onClick={() => setSelectedBorder(b)}
                                            className={`filter-pill haptic-btn text-[11px] ${selectedBorder === b ? "active" : ""}`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 text-[11px] font-semibold"
                                    style={{ color: "var(--status-congested)" }}>
                                    <Warning size={14} weight="fill" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            {file && selectedBorder && (
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
                                            Hantar Snap
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
                        <p className="text-sm font-bold mt-2">Snap dihantar! 📸</p>
                        <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                            Terima kasih, gambar anda membantu traveler lain
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Snap Feed */}
            {snaps.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider px-1"
                        style={{ color: "var(--muted-foreground)" }}>
                        Live Queue Photos
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {snaps.map((snap) => (
                            <motion.div
                                key={snap.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="clean-card overflow-hidden"
                            >
                                <div className="relative">
                                    <img
                                        src={snap.imageUrl}
                                        alt={snap.border}
                                        className="w-full aspect-square object-cover"
                                        loading="lazy"
                                    />
                                    <button
                                        onClick={() => handleFlag(snap.id)}
                                        className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full flex items-center justify-center"
                                        style={{
                                            background: flaggedIds.has(snap.id)
                                                ? "rgba(239,68,68,0.8)"
                                                : "rgba(0,0,0,0.5)",
                                        }}
                                    >
                                        <Flag size={12} weight="fill" color="white" />
                                    </button>
                                </div>
                                <div className="p-2">
                                    <p className="text-[10px] font-bold truncate">{snap.border}</p>
                                    <p className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                                        {snap.nickname} · {formatTime(snap.createdAt)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
