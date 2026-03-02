"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "@phosphor-icons/react";

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as "light" | "dark";
        if (saved) {
            setTheme(saved);
            document.documentElement.className = saved;
        }
    }, []);

    const toggle = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.className = newTheme;
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
