import React, { useEffect, useState } from 'react';

export const HUDOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
            {/* SVG Layer for crisp lines */}
            <svg className="w-full h-full absolute inset-0 opacity-40">
                <defs>
                    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 217, 255, 0.1)" strokeWidth="0.5" />
                    </pattern>
                    <pattern id="hexGrid" width="40" height="34.6" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                        <path d="M20 0 L40 10 L40 30 L20 40 L0 30 L0 10 Z" fill="none" stroke="rgba(0, 217, 255, 0.05)" strokeWidth="0.5" />
                    </pattern>
                </defs>

                {/* Left Panel Backing Decoration - Hugs Left Edge */}
                <g transform="translate(50, 120)">
                    <path d="M0 0 L 20 0 L 20 600 L 0 600" fill="none" stroke="rgba(0, 217, 255, 0.5)" strokeWidth="1" />
                    {/* Tick Marks */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <line key={i} x1="0" y1={i * 30} x2="10" y2={i * 30} stroke="rgba(0, 217, 255, 0.6)" strokeWidth="1" />
                    ))}
                </g>

                {/* Right Panel Backing Decoration - REMOVED (Moved to Div below) */}

                {/* Center Target Bracket - Left (Widened) */}
                <path d="M calc(50% - 400px) calc(50% - 250px) L calc(50% - 430px) calc(50% - 250px) L calc(50% - 430px) calc(50% + 250px) L calc(50% - 400px) calc(50% + 250px)"
                    fill="none" stroke="rgba(0, 217, 255, 0.6)" strokeWidth="2" filter="drop-shadow(0 0 5px rgba(0,217,255,0.5))" />

                {/* Center Target Bracket - Right (Widened) */}
                <path d="M calc(50% + 400px) calc(50% - 250px) L calc(50% + 430px) calc(50% - 250px) L calc(50% + 430px) calc(50% + 250px) L calc(50% + 400px) calc(50% + 250px)"
                    fill="none" stroke="rgba(0, 217, 255, 0.6)" strokeWidth="2" filter="drop-shadow(0 0 5px rgba(0,217,255,0.5))" />

                {/* Connecting Lines (Widened) */}
                <line x1="5%" y1="50%" x2="35%" y2="50%" stroke="rgba(0, 217, 255, 0.3)" strokeDasharray="1000" strokeDashoffset="1000" className="animate-[dash_10s_linear_infinite]" />
                <line x1="65%" y1="50%" x2="95%" y2="50%" stroke="rgba(0, 217, 255, 0.3)" strokeDasharray="1000" strokeDashoffset="1000" className="animate-[dash_10s_linear_infinite_reverse]" />
            </svg>

            {/* Right Panel Backing Decoration - Moved here to use CSS positioning instead of invalid SVG calc() */}
            <div className="absolute top-[120px] right-0 w-[350px] h-[650px] pointer-events-none opacity-40 z-0">
                <svg width="100%" height="100%" viewBox="0 0 350 650" fill="none">
                    <path d="M280 0 L 300 0 L 300 600 L 280 600" fill="none" stroke="rgba(0, 217, 255, 0.5)" strokeWidth="1" />
                    <path d="M0 600 L 100 650 L 300 650" fill="none" stroke="rgba(0, 217, 255, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                </svg>
            </div>

            {/* CSS-based decorative elements */}
            <div className="absolute top-[15%] left-12 w-[150px] h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 shadow-[0_0_10px_cyan]" />
            <div className="absolute top-[15%] right-12 w-[150px] h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 shadow-[0_0_10px_cyan]" />

            {/* TACTICAL HUD SHAPES (Replacing Data Streams) */}
            {/* Left Edge Scale */}
            <div className="absolute top-[20%] left-4 h-[50%] flex flex-col justify-between pointer-events-none">
                {[0, -2, -4, -6].map((num) => (
                    <div key={num} className="flex items-center gap-2">
                        <div className="w-2 h-[1px] bg-cyan-500" />
                        <span className="font-mono text-[10px] text-cyan-500/80">{num}</span>
                    </div>
                ))}
            </div>

            {/* Left Far Edge Segments (Meter Style) */}
            <div className="absolute top-[25%] left-1 w-2 h-[40%] flex flex-col gap-1 pointer-events-none opacity-40">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`w-full h-[2px] ${i % 5 === 0 ? 'bg-cyan-400' : 'bg-cyan-900/40'}`} />
                ))}
            </div>

            {/* Right Edge Scale */}
            <div className="absolute top-[20%] right-4 h-[50%] flex flex-col justify-between items-end pointer-events-none">
                {[0, -2, -4, -6].map((num) => (
                    <div key={num} className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-cyan-500/80">{num}</span>
                        <div className="w-2 h-[1px] bg-cyan-500" />
                    </div>
                ))}
            </div>

            {/* Right Far Edge Segments (Meter Style) */}
            <div className="absolute top-[25%] right-1 w-2 h-[40%] flex flex-col gap-1 pointer-events-none opacity-40">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`w-full h-[2px] ${i % 5 === 0 ? 'bg-cyan-400' : 'bg-cyan-900/40'}`} />
                ))}
            </div>

            {/* Small Bottom Corners (Subtle Data) */}
            <div className="absolute bottom-[10%] left-12 flex items-center gap-3 opacity-60">
                <div className="w-12 h-2 bg-red-900/40 border-l border-red-500" />
                <span className="font-mono text-[8px] text-zinc-500 uppercase">Electricity [72%]</span>
            </div>
        </div>
    );
};

