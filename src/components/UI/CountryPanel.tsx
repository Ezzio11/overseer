"use client";

import { useStore } from "@/lib/store";
import { COUNTRIES } from "@/data/countries";
import { X, Globe, Shield, Activity, Database, Cpu, Radio, ChevronRight, LayoutDashboard, MapPin, TrendingUp, Users, ArrowLeftRight } from "lucide-react";
import { MetricsTab } from "./MetricsTab";
import { ComparisonPanel } from "./ComparisonPanel";
import { useState, useEffect } from "react";
import { TacticalFrame } from "./TacticalFrame";

export default function CountryPanel() {
    const focusedId = useStore((state) => state.focusedCountry);
    const setFocusedCountry = useStore((state) => state.setFocusedCountry);
    const globalEvents = useStore(state => state.globalEvents);

    // Comparison Mode State
    const isComparisonMode = useStore((state) => state.isComparisonMode);
    const setComparisonMode = useStore((state) => state.setComparisonMode);

    const country = focusedId ? COUNTRIES[focusedId] : null;

    const [activeTab, setActiveTab] = useState<'overview' | 'economy' | 'demographics' | 'infrastructure' | 'social' | 'military' | 'alerts' | 'news'>('overview');
    const [news, setNews] = useState<any[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);

    // Reset state when country changes
    useEffect(() => {
        setNews([]);
        // Tabs are now persistent across countries
    }, [country?.id]);

    // Fetch GDELT news (Country-Specific, Last 7 Days) when NEWS tab is active
    useEffect(() => {
        if (!country || activeTab !== 'news') return;
        if (news.length > 0) return;

        setNewsLoading(true);
        // Fetch top 5 most recent news from last 7 days for the selected country
        fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query="${country.name}"&mode=artlist&maxrecords=5&format=json&timespan=7d&sortby=datedesc`)
            .then(res => res.json())
            .then(data => {
                if (data.articles) {
                    setNews(data.articles.slice(0, 5));
                }
            })
            .catch(err => {
                console.error('GDELT fetch failed:', err);
                setNews([]);
            })
            .finally(() => setNewsLoading(false));
    }, [activeTab, country?.id, news.length]);

    if (!country) return null;

    const countryEvents = globalEvents
        .filter(e => e.countryId === country.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    const baseTabs = [
        { id: 'overview', icon: LayoutDashboard, label: 'VIEW' },
        { id: 'demographics', icon: Users, label: 'DEMO' },
        { id: 'economy', icon: TrendingUp, label: 'ECON' },
        { id: 'military', icon: Shield, label: 'MIL' },
        { id: 'infrastructure', icon: Globe, label: 'INF' },
    ] as const;

    const tabs = [
        ...baseTabs,
        ...(countryEvents.length > 0 ? [{ id: 'alerts' as const, icon: Radio, label: '(!)' }] : []),
        { id: 'news' as const, icon: Cpu, label: 'NEWS' },
    ];

    // Helper for formatting large numbers (Population)
    const formatPopulation = (val: number) => {
        if (val >= 1000000000) return { val: (val / 1000000000).toFixed(2), unit: 'B' };
        if (val >= 1000000) return { val: (val / 1000000).toFixed(1), unit: 'M' };
        if (val >= 1000) return { val: (val / 1000).toFixed(1), unit: 'k' };
        return { val: val.toFixed(0), unit: '' };
    };

    // Computed Fields
    // Removed Income Level Badge as per user request ("what the hell is upper mid?")

    const pop = formatPopulation(country.demographics.population);

    return (
        <div className="w-full h-full flex flex-col pointer-events-none animate-in slide-in-from-right duration-500">
            <TacticalFrame className="h-full pointer-events-auto bg-black/80 backdrop-blur-md" variant="default" contentClassName="p-0">
                <div className="flex flex-col h-full relative">

                    {/* --- HEADER --- */}
                    <div className="pt-10 pb-6 px-8 border-b border-white/10 relative overflow-hidden">
                        {/* Background subtle effect */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                {/* Badges Row */}
                                <div className="flex gap-3 mb-4">
                                    <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-800 text-[9px] font-mono text-cyan-400 font-bold tracking-wider">
                                        {country.region?.toUpperCase() || 'UNKNOWN REGION'}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-zinc-400 tracking-wider">
                                        {country.id}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                                    {country.name}
                                </h2>
                                <div className="flex items-center gap-2 text-cyan-500/60 font-mono text-xs tracking-wider">
                                    <MapPin className="w-3 h-3" />
                                    {country.capital.toUpperCase()}
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="flex flex-col items-end gap-2">
                                {/* Close Button */}
                                <button
                                    onClick={() => {
                                        setFocusedCountry(null);
                                        setComparisonMode(false);
                                    }}
                                    className="relative z-50 text-cyan-500/50 hover:text-red-400 transition-colors p-2 cursor-pointer hover:bg-white/5 rounded-full"
                                    aria-label="Close Panel"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                {/* Compare Toggle */}
                                <button
                                    onClick={() => setComparisonMode(!isComparisonMode)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 border transition-all text-[10px] font-mono font-bold tracking-wider uppercase
                                        ${isComparisonMode
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                            : 'bg-black/40 border-white/10 text-zinc-500 hover:text-white hover:border-white/30'}
                                    `}
                                >
                                    <ArrowLeftRight className="w-3 h-3" />
                                    {isComparisonMode ? 'COMPARING' : 'COMPARE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- TABS OR CONTENT --- */}
                    {isComparisonMode ? (
                        <div className="flex-1 overflow-hidden p-8">
                            <ComparisonPanel />
                        </div>
                    ) : (
                        <>
                            {/* --- TAB GRID (REPLACING OLD SCROLL ROW) --- */}
                            <div className="px-8 pb-4 border-b border-white/5 bg-white/[0.01]">
                                <div className="grid grid-cols-3 gap-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`
                                                group flex flex-col items-center justify-center p-3 sm:p-2 border transition-all duration-300
                                                ${activeTab === tab.id
                                                    ? 'bg-cyan-500 border-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105'
                                                    : 'bg-black/40 border-white/10 text-white/40 hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)]/80'
                                                }
                                            `}
                                        >
                                            <tab.icon className={`w-4 h-4 mb-1 ${activeTab === tab.id ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                                            <span className="text-[9px] tracking-wider font-mono uppercase">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- CONTENT AREA --- */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 relative">

                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Primary Stats Grid */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/[0.03] border border-white/10 p-4">
                                                <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">POPULATION</div>
                                                <div className="text-3xl text-white font-mono font-bold tracking-tight">
                                                    {pop.val}<span className="text-lg text-zinc-500 ml-1">{pop.unit}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/[0.03] border border-white/10 p-4">
                                                <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">GDP (TOTAL)</div>
                                                <div className="text-3xl text-white font-mono font-bold tracking-tight">
                                                    ${(country.economy.gdp).toLocaleString()}<span className="text-lg text-zinc-500 ml-1">B</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Stats Three-Col */}
                                        <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-4">
                                            <div>
                                                <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">LIFE EXP</div>
                                                <div className="text-xl text-white font-mono">{country.demographics.lifeExpectancy} <span className="text-xs text-zinc-600">yrs</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">MEDIAN AGE</div>
                                                <div className="text-xl text-white font-mono">{country.demographics.medianAge} <span className="text-xs text-zinc-600">yrs</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">URBAN</div>
                                                <div className="text-xl text-white font-mono">{country.demographics.urbanizationRate}%</div>
                                            </div>
                                        </div>

                                        {/* Rankings / Indices */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-white/[0.02] p-3 border-l-2 border-cyan-500">
                                                <span className="text-xs font-mono text-zinc-400">HUMAN DEV. INDEX</span>
                                                <span className="text-sm font-mono font-bold text-white">{country.social.hdi}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/[0.02] p-3 border-l-2 border-emerald-500">
                                                <span className="text-xs font-mono text-zinc-400">GLOBAL FIREPOWER</span>
                                                <span className="text-sm font-mono font-bold text-white">#{country.military.globalFirepowerRank}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/[0.02] p-3 border-l-2 border-amber-500">
                                                <span className="text-xs font-mono text-zinc-400">PRESS FREEDOM</span>
                                                <span className="text-sm font-mono font-bold text-white">#{country.social.pressFreedomIndex}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Regular Data Tabs */}
                                {(activeTab === 'demographics' || activeTab === 'economy' || activeTab === 'military' || activeTab === 'infrastructure' || activeTab === 'social') && (
                                    <MetricsTab key={`${country.id}-${activeTab}`} category={activeTab} data={country[activeTab]} />
                                )}

                                {/* ALERTS TAB */}
                                {activeTab === 'alerts' && (
                                    <div className="space-y-3">
                                        <div className="text-xs font-mono text-red-500 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            ACTIVE THREATS ({countryEvents.length})
                                        </div>
                                        {countryEvents.map((ev) => (
                                            <div key={ev.id} className="bg-red-950/10 border border-red-500/20 p-4 rounded-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-red-400 font-bold text-xs uppercase tracking-wider">{ev.type}</span>
                                                    <span className="text-[10px] text-red-500/50 font-mono">{new Date(ev.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-red-100/80 leading-relaxed font-mono">{ev.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* NEWS TAB */}
                                {activeTab === 'news' && (
                                    <div className="space-y-3">
                                        {newsLoading ? (
                                            <div className="text-center py-8 text-cyan-500/50 font-mono text-xs animate-pulse">Scanning frequencies...</div>
                                        ) : (
                                            news.map((item, i) => (
                                                <a
                                                    key={i}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block group border-b border-white/5 pb-3 mb-3 last:border-0"
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-cyan-600 font-mono uppercase">{item.domain}</span>
                                                        <ChevronRight className="w-3 h-3 text-cyan-900 group-hover:text-cyan-400 transition-colors" />
                                                    </div>
                                                    <h4 className="text-sm text-zinc-300 group-hover:text-white transition-colors line-clamp-2">{item.title}</h4>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* --- FOOTER STATUS --- */}
                    <div className="px-8 py-3 border-t border-white/10 bg-black/40 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${countryEvents.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                {countryEvents.length > 0 ? 'STATUS: ELEVATED' : 'STATUS: NOMINAL'}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-700">UPDATED: {new Date().toLocaleTimeString()}</span>
                    </div>

                </div>

            </TacticalFrame >
        </div >
    );
}