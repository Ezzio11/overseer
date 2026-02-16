'use client';

import React, { useState, useEffect } from 'react';
import NewsTicker from './NewsTicker';
import { Wifi, Radio, Battery, Activity, Clock, Globe } from 'lucide-react';
import { useStore } from '@/lib/store';

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
        <header className="relative w-full h-32 z-50 pointer-events-none flex justify-center font-sans">

            {/* SVG BACKGROUND - UNCHANGED */}
            <div className="absolute top-0 w-full h-32 overflow-visible pointer-events-none hidden md:block">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                    <defs>
                        <linearGradient id="header-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#05080c" stopOpacity="0.95" />
                            <stop offset="90%" stopColor="#05080c" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0 L100,0 L100,60 C80,60 75,80 50,80 C25,80 20,60 0,60 Z"
                        fill="url(#header-grad)"
                        stroke="rgba(0, 217, 255, 0.2)"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M20,65 L80,65"
                        stroke="rgba(0, 217, 255, 0.1)"
                        strokeWidth="0.5"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* CONTENT CONTAINER - THE FIX */}
            {/* 1. h-20 (80px): Matches the height of the solid black bar part of the SVG. */}
            {/* 2. items-center: Vertically centers content exactly in that 80px space. */}
            {/* 3. Removed all 'pt' padding. We let Flexbox do the centering. */}
            <div className="relative z-10 w-full max-w-[95%] h-20 flex items-center justify-between px-8 pointer-events-auto">

                {/* LEFT: BRANDING */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white leading-none drop-shadow-md">THE OVERSEER</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[9px] text-cyan-500/80 tracking-[0.2em] uppercase">Global Intelligence Network</span>
                                <div className="h-[1px] w-8 bg-cyan-500/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: TICKER */}
                {/* Removed 'mt-1', flex-center handles it */}
                <div className="flex-1 max-w-3xl mx-8 hidden md:block">
                    <div className="relative h-9 bg-black/40 border border-white/10 rounded-full overflow-hidden flex items-center px-4 backdrop-blur-md shadow-lg group">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,217,255,0.03)_50%,transparent_100%)] animate-[scan_4s_linear_infinite]" />
                        <NewsTicker />
                    </div>
                </div>

                {/* VIEW MODE TOGGLE */}
                <div className="hidden lg:flex items-center gap-2 mr-8">
                    <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 backdrop-blur-md">
                        <button
                            onClick={() => useStore.getState().setViewMode('STANDARD')}
                            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all rounded ${useStore(s => s.viewMode) === 'STANDARD' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            STD
                        </button>
                        <button
                            onClick={() => useStore.getState().setViewMode('REALISTIC')}
                            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all rounded ${useStore(s => s.viewMode) === 'REALISTIC' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            REAL
                        </button>
                    </div>
                </div>

                {/* RIGHT: TIME MODULES */}
                <div className="flex items-center gap-8">
                    {/* LOCAL TIME */}
                    <div className="flex items-center gap-3 group">
                        <div className="flex flex-col items-end leading-none">
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">LOCAL SYSTEM</span>
                            <span className="font-mono text-xl font-bold text-white tracking-tight">{localTime}</span>
                        </div>
                        <Clock className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    {/* UTC TIME */}
                    <div className="flex items-center gap-3 group">
                        <div className="flex flex-col items-end leading-none">
                            <span className="font-mono text-[9px] text-cyan-600 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">ZULU (UTC)</span>
                            <span className="font-mono text-xl font-bold text-cyan-400 tracking-tight text-shadow-cyan">{utcTime}</span>
                        </div>
                        <Globe className="w-4 h-4 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                </div>

            </div>
        </header>
    );
};