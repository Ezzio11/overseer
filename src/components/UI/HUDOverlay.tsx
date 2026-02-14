import React, { useEffect, useState } from 'react';

export const HUDOverlay = () => {
    const [leftData, setLeftData] = useState<Array<{ hex: string, val: number }>>([]);
    const [rightData, setRightData] = useState<Array<{ val: number, ver: number }>>([]);

    useEffect(() => {
        setLeftData(Array.from({ length: 10 }).map(() => ({
            hex: Math.random().toString(16).substr(2, 4).toUpperCase(),
            val: Math.floor(Math.random() * 99)
        })));

        setRightData(Array.from({ length: 10 }).map(() => ({
            val: Math.floor(Math.random() * 999),
            ver: Math.floor(Math.random() * 9)
        })));
    }, []);

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

                {/* Right Panel Backing Decoration - Hugs Right Edge */}
                <g transform="translate(calc(100% - 350), 120)">
                    <path d="M280 0 L 300 0 L 300 600 L 280 600" fill="none" stroke="rgba(0, 217, 255, 0.5)" strokeWidth="1" />
                    <path d="M0 600 L 100 650 L 300 650" fill="none" stroke="rgba(0, 217, 255, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                </g>

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

            {/* CSS-based decorative elements */}
            <div className="absolute top-[15%] left-12 w-[150px] h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 shadow-[0_0_10px_cyan]" />
            <div className="absolute top-[15%] right-12 w-[150px] h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 shadow-[0_0_10px_cyan]" />

            {/* Floating Data Streams */}
            <div className="absolute top-[25%] left-12 font-mono text-[11px] text-cyan-400/70 font-bold flex flex-col gap-1 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                {leftData.map((item, i) => (
                    <div key={i} className="flex gap-4">
                        <span>0x{item.hex}</span>
                        <span>{item.val}</span>
                    </div>
                ))}
            </div>

            <div className="absolute top-[25%] right-12 font-mono text-[11px] text-cyan-400/70 font-bold flex flex-col gap-1 text-right drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                {rightData.map((item, i) => (
                    <div key={i} className="flex gap-4 justify-end">
                        <span>{item.val}</span>
                        <span>:: V{item.ver}.0</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

