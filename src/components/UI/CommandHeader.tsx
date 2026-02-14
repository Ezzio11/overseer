'use client';

import React, { useState, useEffect } from 'react';
import NewsTicker from './NewsTicker';
import { Wifi, Radio, Battery, Activity } from 'lucide-react';

export const CommandHeader: React.FC = () => {
    const [localTime, setLocalTime] = useState('');
    const [utcTime, setUtcTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setLocalTime(now.toLocaleTimeString('en-GB', { hour12: false }));
            setUtcTime(now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }));
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center">
            {/* SVG BACKGROUND FRAME */}
            <div className="absolute top-0 w-full h-20 overflow-visible pointer-events-none hidden md:block">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                    <defs>
                        <linearGradient id="header-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#05080c" stopOpacity="0.95" />
                            <stop offset="90%" stopColor="#05080c" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    {/* Main Curved Bar: Wide center, tapering sides */}
                    <path
                        d="M0,0 L100,0 L100,60 C80,60 75,80 50,80 C25,80 20,60 0,60 Z"
                        fill="url(#header-grad)"
                        stroke="rgba(0, 217, 255, 0.2)"
                        strokeWidth="0.5"
                    />
                    {/* Accent Line */}
                    <path
                        d="M20,65 L80,65"
                        stroke="rgba(0, 217, 255, 0.1)"
                        strokeWidth="0.5"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* CONTENT CONTAINER - Centered within the curve */}
            <div className="relative z-10 w-full max-w-[95%] h-16 flex items-start justify-between px-8 pt-2 pointer-events-auto">

                {/* LEFT: BRANDING */}
                <div className="flex flex-col pt-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                            <div className="w-4 h-4 bg-cyan-500 clip-polygon-hex animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white font-heading italic leading-none">THE OVERSEER</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-mono text-cyan-500/60 tracking-[0.3em]">GLOBAL INTELLIGENCE</span>
                                <div className="h-[1px] w-12 bg-cyan-500/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: TICKER (Push down slightly to fit curve) */}
                <div className="flex-1 max-w-4xl mt-4 mx-4">
                    <div className="relative h-8 bg-black/40 border border-white/5 rounded-sm overflow-hidden flex items-center px-4 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,217,255,0.02)_50%,transparent_100%)] animate-[scan_3s_linear_infinite]" />
                        <NewsTicker />
                    </div>
                </div>

                {/* RIGHT: STATS & TIME */}
                <div className="flex items-center gap-8 pt-1">

                    {/* SYSTEM STATUS */}
                    <div className="hidden lg:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-cyan-400/80">
                            <span className="text-[9px] font-mono tracking-wider opacity-70">UPLINK</span>
                            <div className="flex gap-[2px]">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`w-0.5 h-2 ${i <= 3 ? 'bg-cyan-400' : 'bg-cyan-900'} transform -skew-x-12`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400/80">
                            <span className="text-[9px] font-mono tracking-wider opacity-70">SECURE</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>

                    {/* DUAL CLOCK */}
                    <div className="flex items-center gap-4 bg-black/20 px-4 py-1 rounded border border-white/5 backdrop-blur-md">
                        {/* LOCAL TIME */}
                        <div className="text-right">
                            <div className="text-xl font-mono font-bold text-white leading-none tracking-tight">
                                {localTime}
                            </div>
                            <span className="text-[9px] font-mono text-zinc-500 tracking-[0.1em] uppercase">LOCAL</span>
                        </div>

                        {/* DIVIDER */}
                        <div className="h-6 w-[1px] bg-white/10" />

                        {/* UTC TIME */}
                        <div className="text-right">
                            <div className="text-xl font-mono font-bold text-cyan-400 leading-none tracking-tight text-shadow-cyan">
                                {utcTime}
                            </div>
                            <span className="text-[9px] font-mono text-cyan-600 tracking-[0.1em]">ZULU</span>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
};
