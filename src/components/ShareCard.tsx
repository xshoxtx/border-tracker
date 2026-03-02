"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ShareNetwork, DownloadSimple, MapTrifold } from "@phosphor-icons/react";

interface ShareCardProps {
    border: string;
    queueTime: string;
    status: "smooth" | "moderate" | "congested";
}

const STATUS_CONFIG = {
    smooth: { label: "Smooth", color: "#10b981", emoji: "🟢" },
    moderate: { label: "Moderate", color: "#f59e0b", emoji: "🟡" },
    congested: { label: "Congested", color: "#ef4444", emoji: "🔴" },
};

export const ShareCard = ({ border, queueTime, status }: ShareCardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateImage = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current;
            if (!canvas) { resolve(null); return; }

            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(null); return; }

            const w = 1080;
            const h = 1920;
            canvas.width = w;
            canvas.height = h;

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, w, h);
            gradient.addColorStop(0, "#0c1220");
            gradient.addColorStop(0.5, "#1a2744");
            gradient.addColorStop(1, "#0c1220");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            // Subtle accent glow
            const statusCfg = STATUS_CONFIG[status];
            const glowGrad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, 400);
            glowGrad.addColorStop(0, statusCfg.color + "30");
            glowGrad.addColorStop(1, "transparent");
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, w, h);

            // Logo area
            ctx.fillStyle = "#2563eb";
            ctx.beginPath();
            ctx.roundRect(w / 2 - 40, 300, 80, 80, 20);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 28px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("📍", w / 2, 350);

            // App name
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 48px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PATHFINDER", w / 2, 450);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "700 20px system-ui, sans-serif";
            ctx.letterSpacing = "8px";
            ctx.fillText("BORDER  INTELLIGENCE", w / 2, 490);

            // Divider
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.2, 560);
            ctx.lineTo(w * 0.8, 560);
            ctx.stroke();

            // Border name
            ctx.fillStyle = "#ffffff";
            ctx.font = "800 64px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(border, w / 2, 720);

            // Status circle
            ctx.fillStyle = statusCfg.color;
            ctx.beginPath();
            ctx.arc(w / 2, 860, 80, 0, Math.PI * 2);
            ctx.fill();

            // Status ring glow
            ctx.strokeStyle = statusCfg.color + "40";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(w / 2, 860, 95, 0, Math.PI * 2);
            ctx.stroke();

            // Queue time in circle
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 56px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(queueTime, w / 2, 855);

            // Status label
            ctx.fillStyle = statusCfg.color;
            ctx.font = "800 28px system-ui, sans-serif";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(`${statusCfg.emoji}  ${statusCfg.label.toUpperCase()}`, w / 2, 1010);

            // Divider 2
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.2, 1100);
            ctx.lineTo(w * 0.8, 1100);
            ctx.stroke();

            // Date/time
            const now = new Date();
            const dateStr = now.toLocaleDateString("en-MY", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            const timeStr = now.toLocaleTimeString("en-MY", {
                hour: "2-digit",
                minute: "2-digit",
            });

            ctx.fillStyle = "#94a3b8";
            ctx.font = "600 28px system-ui, sans-serif";
            ctx.fillText(dateStr, w / 2, 1180);
            ctx.fillText(timeStr, w / 2, 1220);

            // Watermark
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.font = "700 18px system-ui, sans-serif";
            ctx.fillText("LIVE FROM PATHFINDER — border.creativepresslab.com", w / 2, h - 100);

            canvas.toBlob((blob) => resolve(blob), "image/png");
        });
    }, [border, queueTime, status]);

    const handleShare = async () => {
        const blob = await generateImage();
        if (!blob) return;

        const file = new File([blob], `pathfinder-${border.toLowerCase().replace(/\s/g, "-")}.png`, {
            type: "image/png",
        });

        // Use Web Share API if available
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({
                    title: `Pathfinder — ${border}`,
                    text: `${STATUS_CONFIG[status].emoji} ${border}: ${queueTime} (${STATUS_CONFIG[status].label})`,
                    files: [file],
                });
                return;
            } catch {
                // User cancelled or API failed — fall through to download
            }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <canvas ref={canvasRef} className="hidden" />
            <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleShare}
                className="haptic-btn h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--primary-subtle)" }}
                title="Share border status"
            >
                <ShareNetwork size={14} weight="fill" style={{ color: "var(--primary)" }} />
            </motion.button>
        </>
    );
};
