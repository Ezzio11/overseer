"use client";

import { COUNTRIES } from "@/data/countries";
import { Database, Clock, Globe, Activity, Server, ShieldCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Footer() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        // Set immediately on mount to avoid 1s delay
        setCurrentTime(new Date());

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // 1. PERFORMANCE: Memoize this so it doesn't recalculate every second
    const stats = useMemo(() => {
        const list = Object.values(COUNTRIES);
        return {
            count: list.length,
            population: list.reduce((sum, c) => sum + c.demographics.population, 0)
        };
    }, []); // Empty dependency array = runs once on mount

    const utcTime = currentTime ? currentTime.toUTCString().slice(17, 25) : '--:--:--';
    // const localTime = currentTime ? currentTime.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--';

    return (
        <div className="fixed bottom-0 left-0 right-0 h-12 z-50 flex items-end justify-center pointer-events-none">

            {/* BACKGROUND TRAY - The "Physical" Metal look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/10" />

            {/* CONTENT CONTAINER */}
            <div className="relative w-full max-w-[95%] h-full flex items-center justify-between px-6 pb-1 pointer-events-auto">

                {/* LEFT: SYSTEM STATUS (The "Server Rack" Look) */}
                <div className="flex items-center gap-6">
                    {/* Status Light */}
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-500 font-bold tracking-widest">SYSTEM_NOMINAL</span>
                    </div>

                    {/* Divider */}
                    <div className="h-3 w-[1px] bg-white/10" />

                    {/* Data Sources */}
                    <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-400/80">
                            <Database className="w-3 h-3" />
                            <span>WORLDOMETERS</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-400/80">
                            <Activity className="w-3 h-3" />
                            <span>GDELT</span>
                        </div>
                    </div>
                </div>


                {/* CENTER: VERSION & ID (Subtle Technical Text) */}
                <div className="hidden md:flex items-center gap-2 opacity-30">
                    <ShieldCheck className="w-3 h-3 text-white" />
                    <span className="font-mono text-[9px] tracking-[0.3em] text-white">OVERSEER_OS v2.4.1 // BUILD_9942</span>
                </div>


                {/* RIGHT: LIVE TELEMETRY */}
                <div className="flex items-center gap-6">

                    {/* Population Counter */}
                    <div className="flex flex-col items-end leading-none">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Global Pop</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-mono text-sm font-bold text-white tracking-tighter">
                                {(stats.population / 1_000_000_000).toFixed(3)}
                            </span>
                            <span className="font-mono text-[9px] text-cyan-500">B</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Master Clock */}
                    <div className="flex flex-col items-end leading-none min-w-[80px]">
                        <span className="font-mono text-[9px] text-cyan-600 uppercase tracking-wider mb-0.5">ZULU TIME</span>
                        <span className="font-mono text-sm font-bold text-cyan-400 tracking-widest text-shadow-cyan">
                            {utcTime}
                        </span>
                    </div>

                </div>

            </div>

            {/* DECORATIVE CORNERS (The "Sci-Fi Frame") */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/30" />

        </div>
    );
}