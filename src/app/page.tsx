"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBanner } from "@/components/StatusBanner";
import { BorderCard } from "@/components/BorderCard";
import { CurrencyWidget } from "@/components/CurrencyWidget";
import { NearestBorder } from "@/components/NearestBorder";
import { CrossingReport } from "@/components/CrossingReport";
import { BestTimeWidget } from "@/components/BestTimeWidget";
import { HolidayAlert } from "@/components/HolidayAlert";
import { ChatSystem } from "@/components/ChatSystem";
import { SettingsPage } from "@/components/SettingsPage";
import { PWAAwareness } from "@/components/PWAAwareness";
import { QueueSnap } from "@/components/QueueSnap";
import { IncidentReport } from "@/components/IncidentReport";
import { Leaderboard } from "@/components/Leaderboard";
import {
  House,
  ChatsCircle,
  GearSix,
  MapTrifold,
} from "@phosphor-icons/react";

// Lazy load the map to avoid SSR issues with Leaflet
const QueueMap = dynamic(() => import("@/components/QueueMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full skeleton rounded-2xl" />,
});

type TabId = "home" | "map" | "community" | "settings";

const BORDER_LOCATIONS = ["All", "Sungai Tujuh", "Kuala Lurah", "Ujung Jalan", "Mengkalap"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [trafficData, setTrafficData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeBorder, setActiveBorder] = useState("All");

  const fetchTraffic = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/border");
      const json = await res.json();
      if (json.success) setTrafficData(json.data);
    } catch (err) {
      console.error("Failed to fetch traffic:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 300000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: House },
    { id: "map", label: "Map", icon: MapTrifold },
    { id: "community", label: "Chat", icon: ChatsCircle },
    { id: "settings", label: "Settings", icon: GearSix },
  ];

  const renderBorderGroup = (label: string, keys: string[]) => (
    <div key={label} className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider px-1"
        style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
      <div className="grid gap-3">
        {keys.map((key) => (
          <BorderCard
            key={key}
            location={key}
            queueTime={trafficData?.[key]?.time || "---"}
            status={trafficData?.[key]?.status || "smooth"}
            lastUpdated={trafficData?.[key]?.lastUpdated || "Checking..."}
            loading={loading && !trafficData}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 px-5 pt-safe"
        style={{
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
        }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--primary)" }}>
              <MapTrifold size={16} weight="fill" color="white" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight block leading-none">
                Pathfinder
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}>
                Border Intelligence
              </span>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(16, 185, 129, 0.1)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "var(--status-smooth)" }}>
              Live
            </span>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-2xl mx-auto px-5 page-content">
        <AnimatePresence mode="wait">

          {/* HOME TAB */}
          {activeTab === "home" && (
            <motion.div key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-5 space-y-5"
            >
              {/* Hero Banner */}
              <StatusBanner
                trafficData={trafficData}
                loading={loading}
                onRefresh={fetchTraffic}
              />

              {/* Nearest Border */}
              <NearestBorder />

              {/* Currency Widget */}
              <CurrencyWidget from="BND" to="MYR" />

              {/* Holiday Alert */}
              <HolidayAlert />

              {/* Border Filter */}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {BORDER_LOCATIONS.map((loc) => (
                  <button key={loc}
                    onClick={() => setActiveBorder(loc)}
                    className={`filter-pill haptic-btn flex-shrink-0 ${activeBorder === loc ? "active" : ""}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Border Cards */}
              <div className="space-y-6">
                {(activeBorder === "All" || activeBorder === "Sungai Tujuh") &&
                  renderBorderGroup("Sungai Tujuh", ["Brunei ➔ Miri", "Miri ➔ Brunei"])}
                {(activeBorder === "All" || activeBorder === "Kuala Lurah") &&
                  renderBorderGroup("Kuala Lurah", ["Brunei ➔ Tedungan", "Tedungan ➔ Brunei"])}
                {(activeBorder === "All" || activeBorder === "Ujung Jalan") &&
                  renderBorderGroup("Ujung Jalan", ["Brunei ➔ Pandaruan", "Pandaruan ➔ Brunei"])}
                {(activeBorder === "All" || activeBorder === "Mengkalap") &&
                  renderBorderGroup("Mengkalap", ["Brunei ➔ Lawas", "Lawas ➔ Brunei"])}
              </div>

              {/* Best Time Widget */}
              <BestTimeWidget />
            </motion.div>
          )}

          {/* MAP TAB */}
          {activeTab === "map" && (
            <motion.div key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-5 space-y-4"
            >
              <div>
                <h2 className="section-header">Live Border Map</h2>
                <p className="section-subtitle">Tap markers for queue details</p>
              </div>
              <QueueMap trafficData={trafficData} />
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--status-smooth)" }} />
                  <span className="text-[10px] font-bold" style={{ color: "var(--muted-foreground)" }}>Smooth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--status-moderate)" }} />
                  <span className="text-[10px] font-bold" style={{ color: "var(--muted-foreground)" }}>Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--status-congested)" }} />
                  <span className="text-[10px] font-bold" style={{ color: "var(--muted-foreground)" }}>Congested</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* COMMUNITY TAB */}
          {activeTab === "community" && (
            <motion.div key="community"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-5 space-y-4"
            >
              <div>
                <h2 className="section-header">Community Feed</h2>
                <p className="section-subtitle">Share live updates with travelers</p>
              </div>

              {/* Active Incidents + Report */}
              <IncidentReport />

              {/* Queue Camera Snap */}
              <QueueSnap />

              {/* I Just Crossed */}
              <CrossingReport />

              {/* Leaderboard */}
              <Leaderboard />

              <ChatSystem />
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && <SettingsPage />}

        </AnimatePresence>
      </main>

      {/* ─── Bottom Navigation ─── */}
      <nav className="bottom-nav animate-nav-in">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`nav-item haptic-btn ${isActive ? "active" : ""}`}>
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                color={isActive ? "var(--primary)" : "var(--muted-foreground)"}
              />
              <span className="nav-label" style={{ color: isActive ? "var(--primary)" : undefined }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <PWAAwareness />
    </>
  );
}
