'use client';

import { useStore } from '@/lib/store';
import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NewsTicker() {
    // Mock data for initial render to prevent hydration mismatch if store is empty initially
    const news = useStore((state) => state.news);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Fallback if no news
    const items = news.length > 0 ? news : [
        { id: '1', properties: { title: 'ESTABLISHING SECURE CONNECTION...', domain: 'SYSTEM', url: '#' } },
        { id: '2', properties: { title: 'AWAITING DATA STREAM...', domain: 'NETWORK', url: '#' } }
    ];

    return (
        <div className="w-full h-full flex items-center overflow-hidden relative group">

            {/* LABEL */}
            <div className="flex items-center gap-2 px-3 h-full shrink-0 z-10 bg-black/40 border-r border-cyan-500/20 backdrop-blur-sm">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-cyan-500 tracking-widest">GLOBAL_WIRE</span>
            </div>

            {/* SCROLLING CONTENT */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center mask-scroller">
                <div className="flex animate-marquee items-center whitespace-nowrap">
                    {/* Triple the items for smooth infinite loop */}
                    {[...items, ...items, ...items].map((item, idx) => (
                        <div
                            key={`${item.id}-${idx}`}
                            className="flex items-center gap-2 px-8 cursor-pointer hover:text-cyan-300 transition-colors opacity-80 hover:opacity-100"
                            onClick={() => item.properties.url !== '#' && window.open(item.properties.url, '_blank')}
                        >
                            <span className="text-[9px] text-cyan-700 font-mono tracking-wider">[{item.properties.domain}]</span>
                            <span className="text-[10px] text-cyan-100 font-mono tracking-wide">{item.properties.title}</span>
                            <div className="w-1 h-1 bg-cyan-900 rounded-full ml-2" />
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
                    animation: marquee 1000s linear infinite;
                }
                .group:hover .animate-marquee {
                    animation-play-state: paused;
                }
                .mask-scroller {
                    mask-image: linear-gradient(to right, transparent, black 20px, black 90%, transparent);
                }
            `}</style>
        </div>
    );
}
