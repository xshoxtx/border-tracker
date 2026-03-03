"use client";

import { useEffect, useState } from "react";
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
import { IncidentBanners } from "@/components/IncidentBanners";
import { Leaderboard } from "@/components/Leaderboard";
import { QueueHeatmap } from "@/components/QueueHeatmap";
import { BorderWeather } from "@/components/BorderWeather";
import { CrossingTimer } from "@/components/CrossingTimer";
import {
  House,
  ChatsCircle,
  GearSix,
  Camera,
  ChatText,
  X,
  Trophy,
  MapTrifold,
  Star,
} from "@phosphor-icons/react";

type TabId = "home" | "community" | "settings";
type CommunitySubTab = "chat" | "feed" | "board";

const BORDER_LOCATIONS = ["All", "Sungai Tujuh", "Kuala Lurah", "Ujung Jalan", "Mengkalap"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [communitySubTab, setCommunitySubTab] = useState<CommunitySubTab>("chat");
  const [trafficData, setTrafficData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeBorder, setActiveBorder] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favorite_borders");
      if (saved) setFavorites(JSON.parse(saved));
    }
  }, []);

  const handleFavoriteToggle = (location: string) => {
    setFavorites(prev => {
      const next = prev.includes(location)
        ? prev.filter(f => f !== location)
        : [...prev, location];
      localStorage.setItem("favorite_borders", JSON.stringify(next));
      return next;
    });
  };

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
    { id: "community", label: "Community", icon: ChatsCircle },
    { id: "settings", label: "Settings", icon: GearSix },
  ];

  const communitySubTabs: { id: CommunitySubTab; label: string; icon: React.ElementType }[] = [
    { id: "chat", label: "Chat", icon: ChatText },
    { id: "feed", label: "Feed", icon: Camera },
    { id: "board", label: "Board", icon: Trophy },
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
            isFavorite={favorites.includes(key)}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );

  // All border keys for favorites lookup
  const ALL_BORDER_KEYS = [
    "Brunei ➔ Miri", "Miri ➔ Brunei",
    "Brunei ➔ Tedungan", "Tedungan ➔ Brunei",
    "Brunei ➔ Pandaruan", "Pandaruan ➔ Brunei",
    "Brunei ➔ Lawas", "Lawas ➔ Brunei",
  ];

  const favoritedKeys = ALL_BORDER_KEYS.filter(k => favorites.includes(k));

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

              {/* Crossing Timer */}
              <CrossingTimer />

              {/* Currency Widget */}
              <CurrencyWidget from="BND" to="MYR" />

              {/* Border Weather */}
              <BorderWeather />

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

              {/* ⭐ Favorites Section */}
              {favoritedKeys.length > 0 && activeBorder === "All" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Star size={14} weight="fill" style={{ color: "#ff824c" }} />
                    <p className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "#ff824c" }}>
                      Your Favorites
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {favoritedKeys.map((key) => (
                      <BorderCard
                        key={`fav-${key}`}
                        location={key}
                        queueTime={trafficData?.[key]?.time || "---"}
                        status={trafficData?.[key]?.status || "smooth"}
                        lastUpdated={trafficData?.[key]?.lastUpdated || "Checking..."}
                        loading={loading && !trafficData}
                        isFavorite={true}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                </div>
              )}

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

              {/* Queue Patterns Heatmap */}
              <QueueHeatmap />
            </motion.div>
          )}

          {/* MAP TAB — REMOVED */}

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
                <h2 className="section-header">Community</h2>
                <p className="section-subtitle">Share live updates with travelers</p>
              </div>

              {/* Sub-tab pills */}
              <div className="flex gap-2">
                {communitySubTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCommunitySubTab(id)}
                    className={`filter-pill haptic-btn flex items-center gap-1.5 ${communitySubTab === id ? "active" : ""}`}
                  >
                    <Icon size={14} weight={communitySubTab === id ? "fill" : "regular"} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Incident banners — always visible */}
              <IncidentBanners />

              {/* Sub-tab content */}
              <AnimatePresence mode="wait">
                {communitySubTab === "chat" && (
                  <motion.div key="sub-chat"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Close chat button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCommunitySubTab("feed")}
                        className="haptic-btn flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                      >
                        <X size={12} weight="bold" />
                        Close Chat
                      </button>
                    </div>
                    <CrossingReport />
                    <ChatSystem />
                  </motion.div>
                )}

                {communitySubTab === "feed" && (
                  <motion.div key="sub-feed"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <IncidentReport />
                    <QueueSnap />
                  </motion.div>
                )}

                {communitySubTab === "board" && (
                  <motion.div key="sub-board"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <Leaderboard />
                  </motion.div>
                )}
              </AnimatePresence>
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
