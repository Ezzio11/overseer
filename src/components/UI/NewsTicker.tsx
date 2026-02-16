'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function NewsTicker() {
    const news = useStore((state) => state.news);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. STABLE FALLBACK: Don't return null. 
    // Render "SYSTEM" messages immediately so the layout doesn't jump.
    const fallbackItems = [
        { id: 'init-1', properties: { title: 'ESTABLISHING SECURE CONNECTION...', domain: 'SYSTEM', url: '#' } },
        { id: 'init-2', properties: { title: 'ENCRYPTING DATA STREAM...', domain: 'NETSEC', url: '#' } },
        { id: 'init-3', properties: { title: 'AWAITING UPLINK...', domain: 'SAT_04', url: '#' } }
    ];

    // If not mounted yet, or if mounted but no news, use fallback
    const displayItems = (!mounted || news.length === 0) ? fallbackItems : news;

    // 2. DYNAMIC SPEED: Adjust speed based on content length so short lists don't fly, long lists don't crawl.
    const animationDuration = `${Math.max(40, displayItems.length * 10)}s`;

    return (
        <div className="w-full h-full flex items-center overflow-hidden relative group select-none">

            {/* LABEL - REMOVED BACKGROUND (Parent pill handles the glass look) */}
            <div className="flex items-center gap-3 pr-4 h-full shrink-0 z-10 border-r border-white/10 mr-4">

                {/* 3. HARDWARE PULSE: Replaced Icon with CSS "Diode" */}
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                </div>

                <span className="font-mono text-[10px] font-bold text-cyan-500 tracking-[0.2em]">GLOBAL_WIRE</span>
            </div>

            {/* SCROLLING CONTENT */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center mask-scroller">
                <div
                    className="flex animate-marquee items-center whitespace-nowrap"
                    style={{ animationDuration: animationDuration }}
                >
                    {/* Triple loop for smoothness */}
                    {[...displayItems, ...displayItems, ...displayItems].map((item, idx) => (
                        <div
                            key={`${item.id}-${idx}`}
                            className="flex items-center gap-2 px-6 cursor-pointer group/item transition-all duration-300"
                            onClick={() => item.properties.url !== '#' && window.open(item.properties.url, '_blank')}
                        >
                            {/* Domain Tag */}
                            <span className="font-mono text-[9px] text-cyan-700/80 tracking-wider group-hover/item:text-cyan-500 transition-colors">
                                :: {item.properties.domain.toUpperCase()}
                            </span>

                            {/* Title */}
                            <span className="font-mono text-xs text-cyan-100/90 tracking-wide group-hover/item:text-white group-hover/item:shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-all">
                                {item.properties.title}
                            </span>

                            {/* Separator Dot */}
                            <div className="w-1 h-1 bg-cyan-900/50 rounded-full ml-4" />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation-name: marquee;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    /* Duration is set inline */
                }
                /* Pause on hover for readability */
                .group:hover .animate-marquee {
                    animation-play-state: paused;
                }
                /* The fade effect on edges */
                .mask-scroller {
                    mask-image: linear-gradient(to right, transparent 0%, black 20px, black 95%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 20px, black 95%, transparent 100%);
                }
            `}</style>
        </div>
    );
}