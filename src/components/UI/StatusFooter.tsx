'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Radio, Server, Wind, Thermometer, Sun, Activity, Droplets } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

export const StatusFooter: React.FC = () => {
    // Global Metrics State (Ported from GlobalPanel)
    const [co2, setCo2] = useState(421.5);
    const [tempAnomaly, setTempAnomaly] = useState(1.23);
    const [solarWind, setSolarWind] = useState(450); // km/s
    const [kpIndex, setKpIndex] = useState(3);
    const [oceanCover] = useState(71);

    // Live fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setSolarWind(prev => prev + (Math.random() - 0.5) * 5);
            setCo2(prev => prev + (Math.random() - 0.5) * 0.001);
            if (Math.random() > 0.95) setKpIndex(prev => Math.max(0, Math.min(9, prev + (Math.random() > 0.5 ? 1 : -1))));
            if (Math.random() > 0.8) setTempAnomaly(prev => prev + (Math.random() - 0.5) * 0.01);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 w-full z-50 pointer-events-none flex justify-center">
            {/* SVG BACKGROUND FRAME */}
            <div className="absolute bottom-0 w-full h-24 overflow-visible pointer-events-none hidden md:block">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
                    <defs>
                        <linearGradient id="footer-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.1" />
                            <stop offset="10%" stopColor="#05080c" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#05080c" stopOpacity="0.98" />
                        </linearGradient>
                    </defs>
                    {/* Main Angular Bar: Wide center, sharp angles */}
                    <path
                        d="M0,40 C20,40 25,20 50,20 C75,20 80,40 100,40 L100,100 L0,100 Z"
                        fill="url(#footer-grad)"
                        stroke="rgba(0, 217, 255, 0.2)"
                        strokeWidth="0.5"
                    />
                    {/* Top Accent Line */}
                    <path
                        d="M20,35 L80,35"
                        stroke="rgba(0, 217, 255, 0.1)"
                        strokeWidth="0.5"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[95%] h-16 flex items-center justify-between px-8 pointer-events-auto">

                {/* LEFT: SYSTEM STATUS */}
                <div className="flex items-center gap-6 w-[250px]">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-emerald-400 tracking-wider">SECURE</span>
                            <span className="text-[8px] font-mono text-emerald-400/50">TLS 1.3</span>
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-cyan-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-cyan-400 tracking-wider">UPLINK</span>
                            <span className="text-[8px] font-mono text-cyan-400/50">ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* CENTER: PLANETARY METRICS (Streamlined Ticker) */}
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-8 px-8 py-1 bg-black/20 border border-white/5 rounded-full backdrop-blur-sm">

                        {/* CO2 */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <Wind className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-cyan-500/70 transition-colors">CO2 (PPM)</span>
                                <span className="font-data text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    <AnimatedNumber value={co2} format={v => v.toFixed(1)} />
                                </span>
                            </div>
                        </div>

                        <div className="w-[1px] h-6 bg-white/5" />

                        {/* TEMP */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <Thermometer className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-amber-500/70 transition-colors">ANOMALY</span>
                                <span className="font-data text-sm font-bold text-amber-500 group-hover:text-amber-400 transition-colors">
                                    +<AnimatedNumber value={tempAnomaly} format={v => v.toFixed(2)} />°C
                                </span>
                            </div>
                        </div>

                        <div className="w-[1px] h-6 bg-white/5" />

                        {/* SOLAR */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <Sun className="w-3 h-3 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-orange-500/70 transition-colors">SOLAR WIND</span>
                                <span className="font-data text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    <AnimatedNumber value={solarWind} format={v => v.toFixed(0)} /> <span className="text-xs text-zinc-600">km/s</span>
                                </span>
                            </div>
                        </div>

                        <div className="w-[1px] h-6 bg-white/5" />

                        {/* BIO */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <Droplets className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-emerald-500/70 transition-colors">H2O COVER</span>
                                <span className="font-data text-sm font-bold text-emerald-500/80 group-hover:text-emerald-400 transition-colors">
                                    {oceanCover}%
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT: SERVER STATUS */}
                <div className="flex items-center gap-6 w-[250px] justify-end">
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-cyan-400" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-mono text-cyan-400 tracking-wider">SENTINEL</span>
                            <span className="text-[8px] font-mono text-cyan-400/50">ONLINE</span>
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono text-emerald-400 tracking-wider">99.8% UPTIME</span>
                        <div className="flex gap-1 mt-0.5">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};
