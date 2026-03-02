"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneTilt, User, ShieldWarning, CheckCircle, PencilSimple } from "@phosphor-icons/react";

interface Message {
    id: string;
    user: string;
    message: string;
    time: string;
    isMe: boolean;
}

export const ChatSystem = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [nickname, setNickname] = useState("");
    const [isNaming, setIsNaming] = useState(true);
    const [lastSent, setLastSent] = useState(0);
    const [showCooldown, setShowCooldown] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load nickname from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("chat_nickname");
        if (saved) { setNickname(saved); setIsNaming(false); }
    }, []);

    // Fetch messages from API
    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch("/api/chat");
            const json = await res.json();
            if (json.success && json.messages) {
                const savedNick = localStorage.getItem("chat_nickname") || "";
                const mapped: Message[] = json.messages.map((m: any) => ({
                    id: m.id.toString(),
                    user: m.user,
                    message: m.message,
                    time: m.time,
                    isMe: m.user === savedNick,
                }));
                setMessages(mapped);
                setMsgCount(mapped.length);
            }
        } catch (err) {
            console.error("Failed to fetch chat:", err);
        }
    }, []);

    // Initial fetch + poll every 10 seconds
    useEffect(() => {
        if (!isNaming) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [isNaming, fetchMessages]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const now = Date.now();
        if (now - lastSent < 5000) {
            setShowCooldown(true);
            setTimeout(() => setShowCooldown(false), 2000);
            return;
        }

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newMsg: Message = {
            id: now.toString(),
            user: nickname || "Stranger",
            message: input,
            time,
            isMe: true,
        };

        // Optimistic update
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        setLastSent(now);

        // Persist to API
        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: nickname || "Stranger",
                    message: input,
                    time,
                }),
            });
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const saveNickname = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            localStorage.setItem("chat_nickname", nickname);
            setIsNaming(false);
        }
    };

    if (isNaming) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8 flex flex-col items-center gap-6 text-center">
                <div className="h-16 w-16 rounded-3xl flex items-center justify-center"
                    style={{ background: "var(--primary-subtle)" }}>
                    <User size={28} weight="fill" color="var(--primary)" />
                </div>
                <div>
                    <h3 className="font-black text-lg tracking-tight">Set Your Nickname</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Join the community — share live updates
                    </p>
                </div>
                <form onSubmit={saveNickname} className="w-full space-y-3">
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                        placeholder="Your nickname..." className="native-input text-center"
                        maxLength={15} required />
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                        <CheckCircle size={18} weight="fill" />
                        Start Chatting
                    </button>
                </form>
            </motion.div>
        );
    }

    return (
        <div className="glass-card rounded-3xl p-5 flex flex-col gap-4" style={{ height: 480 }}>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full opacity-50">
                        <p className="text-xs font-bold">No messages yet — be the first! 💬</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div key={msg.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                                <div className={`flex items-center gap-1.5 mb-1 ${msg.isMe ? "flex-row-reverse" : ""}`}
                                    style={{ color: "var(--muted-foreground)" }}>
                                    <span className="text-[9px] font-black uppercase tracking-widest"
                                        style={{ color: msg.isMe ? "var(--primary)" : undefined }}>{msg.user}</span>
                                    <span className="text-[8px]">{msg.time}</span>
                                </div>
                                <div className={`max-w-[85%] px-4 py-2.5 text-sm font-medium leading-snug
                ${msg.isMe
                                        ? "rounded-2xl rounded-tr-sm text-white"
                                        : "rounded-2xl rounded-tl-sm"}`}
                                    style={{
                                        background: msg.isMe ? "var(--primary)" : "var(--surface-2)",
                                        border: msg.isMe ? "none" : "1px solid var(--border)",
                                    }}>
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Cooldown warning */}
            <AnimatePresence>
                {showCooldown && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center gap-2 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        style={{ background: "rgba(239,68,68,0.1)", color: "var(--status-congested)" }}>
                        <ShieldWarning size={13} weight="fill" />
                        Slow down! 5s cooldown.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Share an update..." className="native-input"
                    maxLength={100} />
                <button type="submit" disabled={!input.trim()} className="haptic-btn flex-shrink-0
          h-12 w-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background: "var(--primary)" }}>
                    <PaperPlaneTilt size={18} weight="fill" color="white" />
                </button>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: "var(--muted-foreground)" }}>{msgCount} Messages</span>
                </div>
                <button onClick={() => setIsNaming(true)}
                    className="haptic-btn flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}>
                    <PencilSimple size={10} />Change Name
                </button>
            </div>
        </div>
    );
};
