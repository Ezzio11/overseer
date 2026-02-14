'use client';

import React from 'react';

export default function CosmicBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-transparent">
            {/* NEBULA 1 - Deep Blue (Top Right drifting) */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#0A1F44]/30 blur-[100px] animate-float"
                style={{ animationDuration: '30s' }} />

            {/* NEBULA 2 - Cyan Accent (Far Left drifting) */}
            <div className="absolute top-[20%] -left-[10%] w-[30vw] h-[30vw] rounded-full bg-cyan-900/10 blur-[80px] animate-pulse-slow"
                style={{ animationDuration: '20s' }} />

            {/* NEBULA 3 - Bottom Center Glow (Subtle) */}
            <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[40vh] rounded-full bg-[#020b1a]/50 blur-[120px]" />

            {/* SCANLINE TEXTURE OVERLAY */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-[0.02] mix-blend-overlay" />

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-20px, 40px) scale(1.1); }
                }
                .animate-float {
                    animation: float infinite ease-in-out;
                }
                .animate-pulse-slow {
                    animation: pulse 15s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
