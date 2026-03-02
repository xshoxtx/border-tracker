"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, MapPin, Utensils, Sparkles, Navigation, Globe, Phone, Clock, Star, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ATTRACTIONS = [
    {
        name: "Canada Hill",
        category: "Historical & Landmark",
        description: "Visit 'The Grand Old Lady', Malaysia's first oil well, and enjoy breathtaking panoramic views of Miri city and the South China Sea.",
        image: "/images/miri/canada_hill.png",
        tags: ["Iconic", "Sunset", "Museum"],
        link: "https://www.google.com/maps/search/Canada+Hill+Miri"
    },
    {
        name: "Niah National Park",
        category: "UNESCO Candidate",
        description: "Explore world-renowned archaeological cave systems featuring prehistoric human remains and ancient paintings.",
        image: "/images/miri/niah_caves.png",
        tags: ["Nature", "History", "Adventure"],
        link: "https://www.google.com/maps/search/Niah+National+Park"
    },
    {
        name: "Tusan Beach",
        category: "Coastal Beauty",
        description: "Famous for the rare 'Blue Tears' bioluminescence and the iconic seahorse-shaped cliff (though partially collapsed, still stunning).",
        image: "/images/miri/tusan_beach.png",
        tags: ["Beach", "Photography", "Night Life"],
        link: "https://www.google.com/maps/search/Tusan+Beach+Miri"
    },
    {
        name: "Gunung Mulu National Park",
        category: "UNESCO World Heritage",
        description: "Wait until you see the world's largest cave chamber! Accessible via a short flight from Miri. A bucket-list experience.",
        image: "/images/miri/gunung_mulu.png",
        tags: ["World Heritage", "Hiking", "Caves"],
        link: "https://www.google.com/maps/search/Gunung+Mulu+National+Park"
    },
    {
        name: "Coco Cabana",
        category: "Lifestyle",
        description: "The premier spot for sunset viewing, dining, and checking out Miri's artistic community and the Seahorse Lighthouse.",
        image: "/images/miri/coco_cabana.png",
        tags: ["Leisure", "Sunset", "Dining"],
        link: "https://www.google.com/maps/search/Coco+Cabana+Miri"
    }
];

const FOOD_SPOTS = [
    {
        name: "Ming Cafe Miri",
        category: "Local & Western",
        specialty: "Mee Kolok & Nasi Lemak",
        description: "A legendary spot with a vibrant atmosphere. Perfect for lunch or a lively dinner with friends.",
        image: "/images/miri/ming_cafe.png",
        rating: 4.8,
        link: "https://www.google.com/maps/search/Ming+Cafe+Miri"
    },
    {
        name: "Saberkas Night Market",
        category: "Street Food",
        specialty: "Sarawak Laksa & Satay",
        description: "The ultimate hub for local Sarawakian street food. Opens in the evening with hundreds of choices.",
        image: "/images/miri/ming_cafe.png",
        rating: 4.9,
        link: "https://www.google.com/maps/search/Saberkas+Night+Market"
    },
    {
        name: "Meng Chai Seafood",
        category: "Seafood",
        specialty: "Fresh Mud Crabs",
        description: "Miri is famous for seafood. This place serves the freshest catch from the South China Sea.",
        image: "/images/miri/seafood.png",
        rating: 4.7,
        link: "https://www.google.com/maps/search/Meng+Chai+Seafood+Miri"
    },
    {
        name: "Tamu Muhibbah",
        category: "Morning Market",
        specialty: "Exotic Fruits & Kuih",
        description: "Authentic jungle produce and traditional snacks. Visit early morning for the best experience.",
        image: "/images/miri/seafood.png",
        rating: 4.6,
        link: "https://www.google.com/maps/search/Tamu+Muhibbah+Miri"
    }
];

export default function MiriPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30">
            {/* Header Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                </Link>
                <ThemeToggle />
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-32">
                {/* Hero Section */}
                <section className="space-y-8 relative">
                    <div className="absolute top-0 -left-20 w-64 h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                        >
                            <Navigation size={12} />
                            Miri City Guide 2026
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-outfit font-black tracking-tighter"
                        >
                            Gateway to <br /> <span className="text-primary italic">Borneo.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-foreground/40 font-medium max-w-2xl leading-relaxed"
                        >
                            Miri isn't just a border city—it's a vibrant culinary capital and the heart of Sarawak's natural wonders. Discover where to eat and what to see while you wait for the queue to clear.
                        </motion.p>
                    </div>
                </section>

                {/* Attractions Section */}
                <section className="space-y-12">
                    <div className="flex items-end justify-between border-b border-white/5 pb-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-outfit font-bold flex items-center gap-3">
                                <Sparkles className="text-primary" /> Top Attractions
                            </h2>
                            <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest italic">The Must-Visit Gems</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ATTRACTIONS.map((item, idx) => (
                            <motion.a
                                key={idx}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative glass-card rounded-[2.5rem] border-white/5 hover:border-primary/30 transition-all overflow-hidden flex flex-col h-full bg-secondary/20"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                                </div>

                                <div className="p-8 space-y-4 flex-1 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">{item.category}</span>
                                            <h3 className="text-2xl font-outfit font-black mt-1 group-hover:text-primary transition-colors">{item.name}</h3>
                                        </div>
                                        <div className="p-2 rounded-full border border-white/10 opacity-40 group-hover:opacity-100 group-hover:bg-primary group-hover:text-black transition-all">
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground/40 font-medium leading-relaxed italic">{item.description}</p>

                                    <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                                        {item.tags.map((tag, tIdx) => (
                                            <span key={tIdx} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </section>

                {/* Food Section */}
                <section className="space-y-12">
                    <div className="flex items-end justify-between border-b border-white/5 pb-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-outfit font-bold flex items-center gap-3">
                                <Utensils className="text-accent" /> Culinary Hits
                            </h2>
                            <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest italic">Where the locals eat</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {FOOD_SPOTS.map((item, idx) => (
                            <motion.a
                                key={idx}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group glass-card rounded-[3rem] border-white/5 hover:border-accent/30 transition-all flex flex-col md:flex-row h-full overflow-hidden bg-secondary/10"
                            >
                                <div className="h-64 md:h-full w-full md:w-48 lg:w-64 shrink-0 overflow-hidden relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-accent/10 mix-blend-overlay opacity-0 group-hover:opacity-40 transition-opacity" />
                                </div>
                                <div className="p-8 md:p-10 space-y-4 flex flex-col justify-center">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-outfit font-bold">{item.name}</h3>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 rounded-lg text-accent text-[10px] font-black">
                                            <Star size={10} fill="currentColor" /> {item.rating}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-accent italic">Specialty: {item.specialty}</p>
                                    <p className="text-sm text-foreground/40 font-medium leading-relaxed">{item.description}</p>
                                    <div className="pt-4 flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                        View on Maps <ArrowUpRight size={14} />
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center space-y-8 py-20">
                    <div className="h-20 w-[1px] bg-gradient-to-b from-primary to-transparent mx-auto" />
                    <h2 className="text-3xl md:text-5xl font-outfit font-black">Ready to cross?</h2>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform shadow-xl shadow-primary/20"
                    >
                        Check Live Queues
                    </Link>
                </section>
            </main>

            <footer className="py-12 border-t border-white/5 text-center px-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
                    &copy; 2026 BorderTracker Malaysia • Optimized For Miri Travelers
                </p>
            </footer>
        </div>
    );
}
