"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "@phosphor-icons/react";

export const ThemeToggle = () => {
    // Read from DOM directly — blocking script already set data-theme before hydration
    // This prevents a flash where state defaults to "dark" before useEffect runs
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof document !== "undefined") {
            const t = document.documentElement.getAttribute("data-theme");
            if (t === "light" || t === "dark") return t;
        }
        return "dark";
    });

    useEffect(() => {
        // Sync with DOM on mount (covers edge cases where lazy hydration differs)
        const domTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
        if (domTheme && domTheme !== theme) {
            setTheme(domTheme);
        }

        // Listen for storage changes from other tabs
        const onStorage = (e: StorageEvent) => {
            if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
                setTheme(e.newValue);
                document.documentElement.setAttribute("data-theme", e.newValue);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        // Use setAttribute — does NOT touch font variable classNames on <html>
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <button
            onClick={toggle}
            className="p-3 rounded-2xl glass-card text-foreground hover:text-primary transition-all active:scale-95 group"
            aria-label="Toggle Theme"
        >
            <motion.div
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
            >
                {theme === "dark" ? (
                    <Sun size={20} className="group-hover:scale-110 transition-transform" />
                ) : (
                    <Moon size={20} className="group-hover:scale-110 transition-transform" />
                )}
            </motion.div>
        </button>
    );
};
