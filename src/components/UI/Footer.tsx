"use client";

import { COUNTRIES } from "@/data/countries";
import { Database, Clock, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date()); // Set initial client time
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate global statistics
    const countryList = Object.values(COUNTRIES);
    const totalCountries = countryList.length;
    const globalPopulation = countryList.reduce((sum, c) => sum + c.demographics.population, 0);

    const utcTime = currentTime ? currentTime.toUTCString().slice(17, 25) : '--:--:--';
    const localTime = currentTime ? currentTime.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--';

    return (
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-void/90 backdrop-blur-xl border-t border-primary/30 z-50 flex items-center px-8 shadow-[0_-4px_20px_rgba(0,255,148,0.1)]">

            {/* LEFT: Data Sources */}
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                    <Database className="w-3 h-3 text-primary" />
                    <span className="text-primary font-semibold">WORLDOMETERS</span>
                </div>
                <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                    <Globe className="w-3 h-3" />
                    <span>USGS</span>
                </div>
                <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                    <Database className="w-3 h-3" />
                    <span>GDELT</span>
                </div>
            </div>

            {/* CENTER: System Time */}
            <div className="flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-info" />
                    <span className="text-zinc-500">UTC</span>
                    <span className="text-white font-semibold">{utcTime}</span>
                </div>
                <div className="w-[2px] h-4 bg-white/10" />
                <div className="flex items-center gap-2">
                    <span className="text-zinc-500">LOCAL</span>
                    <span className="text-white font-semibold">{localTime}</span>
                </div>
            </div>

            {/* RIGHT: Global Stats */}
            <div className="flex items-center gap-6 flex-1 justify-end text-[10px] font-mono uppercase">
                <div className="flex flex-col items-end">
                    <span className="text-zinc-500">TRACKED</span>
                    <span className="text-primary font-bold text-sm">{totalCountries}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-zinc-500">GLOBAL POP</span>
                    <span className="text-white font-bold text-sm">
                        {(globalPopulation / 1_000_000_000).toFixed(2)}B
                    </span>
                </div>
            </div>

        </div>
    );
}
