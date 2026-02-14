'use client';

import React from 'react';
import { Shield, Radio, Server } from 'lucide-react';

export const StatusFooter: React.FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 w-full z-50 pointer-events-none flex justify-center">
            {/* SVG BACKGROUND FRAME */}
            <div className="absolute bottom-0 w-full h-24 overflow-visible pointer-events-none hidden md:block">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
                    <defs>
                        <linearGradient id="footer-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.1" />
                            <stop offset="10%" stopColor="#05080c" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#05080c" stopOpacity="0.95" />
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
            <div className="relative z-10 w-full max-w-[95%] h-20 flex items-end justify-between px-8 pb-3 pointer-events-auto">

                {/* LEFT: SYSTEM STATUS */}
                <div className="flex items-center gap-6">
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

                {/* CENTER: BRANDING */}
                <div className="text-center">
                    <div className="text-[9px] font-mono text-white/30 tracking-[0.3em]">
                        POWERED BY ATLAS INTELLIGENCE
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                        <div className="h-[1px] w-8 bg-cyan-500/20" />
                        <span className="text-[8px] font-mono text-cyan-500/40">v2.4.1</span>
                        <div className="h-[1px] w-8 bg-cyan-500/20" />
                    </div>
                </div>

                {/* RIGHT: SERVER STATUS */}
                <div className="flex items-center gap-6">
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
