"use client";

import { useStore } from "@/lib/store";
import { COUNTRIES } from "@/data/countries";
import { X, Globe, Shield, Activity, Database, Cpu, Radio, ChevronRight, LayoutDashboard, MapPin, TrendingUp, Users, ArrowLeftRight, Palette, Scroll, Building2, AlertTriangle, BookOpen, User } from "lucide-react";
import { MetricsTab } from "./MetricsTab";
import { ComparisonPanel } from "./ComparisonPanel";
import { useState, useEffect, useMemo } from "react";
import { TacticalFrame } from "./TacticalFrame";
import { AnimatedNumber } from "./AnimatedNumber";

// Types for News
interface NewsArticle {
    url: string;
    title: string;
    domain: string;
    seendate: string;
}

export default function CountryPanel() {
    const focusedId = useStore((state) => state.focusedCountry);
    const setFocusedCountry = useStore((state) => state.setFocusedCountry);
    const globalEvents = useStore(state => state.globalEvents);

    // Comparison Mode State
    const isComparisonMode = useStore((state) => state.isComparisonMode);
    const setComparisonMode = useStore((state) => state.setComparisonMode);

    const country = focusedId ? COUNTRIES[focusedId] : null;

    const [activeTab, setActiveTab] = useState<string>('overview');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [now, setNow] = useState(new Date());

    // Update footer clock
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Tab Validation & Reset on Country Change
    useEffect(() => {
        setNews([]);

        // Safety: If the current tab doesn't exist for the new country (e.g. History), reset to Overview
        // We defer this check slightly to let the `tabs` calculation run first
        const validTabs = getValidTabs(country);
        if (!validTabs.find(t => t.id === activeTab)) {
            setActiveTab('overview');
        }
    }, [country?.id]);

    // Fetch GDELT news with AbortController
    useEffect(() => {
        if (!country || activeTab !== 'news') return;
        if (news.length > 0) return;

        const controller = new AbortController();
        setNewsLoading(true);

        fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query="${country.name}"&mode=artlist&maxrecords=5&format=json&timespan=7d&sortby=datedesc`, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (data.articles) {
                    setNews(data.articles.slice(0, 5));
                }
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('GDELT fetch failed:', err);
                    setNews([]);
                }
            })
            .finally(() => setNewsLoading(false));

        return () => controller.abort();
    }, [activeTab, country?.id]);

    // Helper to calculate valid tabs based on country data availability
    const getValidTabs = (c: typeof country) => {
        if (!c) return [];
        const countryEvents = globalEvents.filter(e => e.countryId === c.id);

        return [
            { id: 'overview', icon: LayoutDashboard, label: 'VIEW' },
            { id: 'demographics', icon: Users, label: 'DEMO' },
            { id: 'economy', icon: TrendingUp, label: 'ECON' },
            { id: 'military', icon: Shield, label: 'MIL' },
            { id: 'infrastructure', icon: Globe, label: 'INF' },
            ...(c.cultural ? [{ id: 'culture', icon: Palette, label: 'CULTURE' }] : []),
            ...(c.historical ? [{ id: 'history', icon: Scroll, label: 'HISTORY' }] : []),
            ...(c.government ? [{ id: 'govt', icon: Building2, label: 'GOVT' }] : []),
            ...(countryEvents.length > 0 ? [{ id: 'alerts', icon: AlertTriangle, label: 'ALERTS', alert: true }] : []),
            { id: 'news', icon: Radio, label: 'NEWS' },
        ];
    };

    if (!country) return null;

    const countryEvents = globalEvents
        .filter(e => e.countryId === country.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    const tabs = getValidTabs(country);

    const formatPopulation = (val: number) => {
        if (val >= 1000000000) return { val: (val / 1000000000).toFixed(2), unit: 'B' };
        if (val >= 1000000) return { val: (val / 1000000).toFixed(1), unit: 'M' };
        if (val >= 1000) return { val: (val / 1000).toFixed(1), unit: 'k' };
        return { val: val.toFixed(0), unit: '' };
    };

    const pop = formatPopulation(country.demographics.population);

    return (
        <div className="w-full h-full flex flex-col pointer-events-none animate-in slide-in-from-right duration-500">
            <TacticalFrame className="h-full pointer-events-auto bg-black/80 backdrop-blur-md" variant="default" contentClassName="p-0">
                <div className="flex flex-col h-full relative">

                    {/* --- HEADER --- */}
                    <div className="pt-10 pb-6 px-[28px] border-b border-white/10 relative overflow-hidden group">
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />

                        {/* Background subtle sheen */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-cyan-900/20 to-transparent pointer-events-none opacity-50" />

                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                {/* Badges Row */}
                                <div className="flex gap-2 mb-3">
                                    <span className="px-1.5 py-0.5 bg-cyan-950/50 border border-cyan-500/30 font-mono text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                                        {country.region || 'UNKNOWN_SEC'}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-zinc-900/80 border border-zinc-700 font-mono text-[10px] text-zinc-500 tracking-widest">
                                        ID: {country.id}
                                    </span>
                                </div>
                                <h2 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 uppercase tracking-tactical-wide leading-none mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    {country.name}
                                </h2>
                                <div className="flex items-center gap-2 text-cyan-500/60 font-mono text-xs tracking-widest uppercase">
                                    <MapPin className="w-3 h-3" />
                                    CAPITAL_CITY // {country.capital}
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="flex flex-col items-end gap-3">
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

                                <button
                                    onClick={() => setComparisonMode(!isComparisonMode)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 border transition-all font-mono text-[10px] font-bold tracking-widest uppercase
                                        ${isComparisonMode
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                            : 'bg-black/40 border-white/10 text-zinc-500 hover:text-white hover:border-white/30'}
                                    `}
                                >
                                    <ArrowLeftRight className="w-3 h-3" />
                                    {isComparisonMode ? 'ACTIVE_COMP' : 'COMPARE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- TABS OR CONTENT --- */}
                    {isComparisonMode ? (
                        <div className="flex-1 overflow-hidden p-[28px]">
                            <ComparisonPanel />
                        </div>
                    ) : (
                        <>
                            {/* --- TACTICAL TAB GRID --- */}
                            <div className="px-[28px] py-4 border-b border-white/5 bg-black/20">
                                <div className="grid grid-cols-4 gap-1.5">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                relative group flex flex-col items-center justify-center p-2 border transition-all duration-200 overflow-hidden
                                                ${activeTab === tab.id
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                                    : 'bg-black/40 border-white/5 text-zinc-600 hover:text-cyan-200 hover:border-white/20'
                                                }
                                                ${(tab as any).alert ? 'animate-pulse border-red-500/50 text-red-500' : ''}
                                            `}
                                        >
                                            {/* Active Corner Brackets */}
                                            {activeTab === tab.id && (
                                                <>
                                                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400" />
                                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-400" />
                                                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-400" />
                                                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400" />
                                                </>
                                            )}

                                            <tab.icon className={`w-3.5 h-3.5 mb-1.5 ${activeTab === tab.id ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-cyan-200'}`} />
                                            <span className="font-mono text-[9px] font-bold tracking-widest">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- CONTENT AREA --- */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-[28px] py-[24px] relative">

                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {/* Primary Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/[0.02] border border-white/10 p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                                                <div className="font-mono text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">Population</div>
                                                <div className="font-display text-4xl text-white font-bold tracking-tighter flex items-baseline gap-1">
                                                    <AnimatedNumber
                                                        value={parseFloat(pop.val)}
                                                        format={(v) => v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                    />
                                                    <span className="text-lg text-cyan-500 font-mono">{pop.unit}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/[0.02] border border-white/10 p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                                                <div className="font-mono text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">GDP (Total)</div>
                                                <div className="font-display text-4xl text-white font-bold tracking-tighter flex items-baseline gap-1">
                                                    <span className="text-2xl text-zinc-600 font-sans align-top mt-1">$</span>
                                                    <AnimatedNumber
                                                        value={country.economy.gdp}
                                                        format={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    />
                                                    <span className="text-lg text-cyan-500 font-mono">B</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Stats */}
                                        <div className="grid grid-cols-3 gap-0 border-y border-white/5">
                                            <div className="py-4 border-r border-white/5 pr-4">
                                                <div className="font-mono text-[9px] text-zinc-500 uppercase mb-1">Life Exp</div>
                                                <div className="font-data text-xl text-white">{country.demographics.lifeExpectancy} <span className="text-[10px] text-zinc-600">YRS</span></div>
                                            </div>
                                            <div className="py-4 px-4 border-r border-white/5">
                                                <div className="font-mono text-[9px] text-zinc-500 uppercase mb-1">Median Age</div>
                                                <div className="font-data text-xl text-white">{country.demographics.medianAge} <span className="text-[10px] text-zinc-600">YRS</span></div>
                                            </div>
                                            <div className="py-4 pl-4">
                                                <div className="font-mono text-[9px] text-zinc-500 uppercase mb-1">Urban</div>
                                                <div className="font-data text-xl text-white">{country.demographics.urbanizationRate}<span className="text-sm text-zinc-600">%</span></div>
                                            </div>
                                        </div>

                                        {/* Indices */}
                                        <div className="space-y-3 pt-2">
                                            {[
                                                { label: 'Human Dev. Index', value: country.social.hdi, color: 'cyan' },
                                                { label: 'Global Firepower', value: `#${country.military.globalFirepowerRank}`, color: 'emerald' },
                                                { label: 'Press Freedom', value: `#${country.social.pressFreedomIndex}`, color: 'amber' }
                                            ].map((idx, i) => (
                                                <div key={i} className={`grid grid-cols-[1fr_auto] gap-3 items-center bg-white/[0.02] p-3 border-l-2 border-${idx.color}-500`}>
                                                    <span className="font-mono text-xs text-zinc-400 uppercase tracking-wide">{idx.label}</span>
                                                    <span className="font-mono text-sm font-bold text-white text-right">{idx.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Regular Data Tabs */}
                                {(activeTab === 'demographics' || activeTab === 'economy' || activeTab === 'military' || activeTab === 'infrastructure' || activeTab === 'social') && (
                                    <MetricsTab key={`${country.id}-${activeTab}`} category={activeTab} data={country[activeTab]} />
                                )}

                                {/* ALERTS TAB */}
                                {activeTab === 'alerts' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
                                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                                            <span>ACTIVE THREAT LEVEL: ELEVATED</span>
                                        </div>
                                        {countryEvents.map((ev) => (
                                            <div key={ev.id} className="relative pl-6 border-l border-red-500/20 pb-6 last:pb-0">
                                                <div className="absolute -left-1 top-0 w-2 h-2 bg-red-500 rounded-full" />
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-red-400 font-bold text-xs uppercase tracking-wider">{ev.type}</span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">{new Date(ev.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-zinc-300 leading-relaxed font-mono">{ev.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* NEWS TAB */}
                                {activeTab === 'news' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {newsLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-cyan-500/50">
                                                <Radio className="w-8 h-8 animate-spin" />
                                                <span className="font-mono text-xs animate-pulse">SCANNING FREQUENCIES...</span>
                                            </div>
                                        ) : (
                                            news.map((item, i) => (
                                                <a
                                                    key={i}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block group bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 p-4 transition-all hover:bg-white/[0.04]"
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="px-1.5 py-0.5 bg-cyan-950 text-[9px] text-cyan-400 font-mono uppercase rounded-sm border border-cyan-900">
                                                            {item.domain}
                                                        </span>
                                                        <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                                                    </div>
                                                    <h4 className="text-sm text-zinc-300 group-hover:text-white transition-colors leading-snug font-medium">
                                                        {item.title}
                                                    </h4>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* CULTURE TAB */}
                                {activeTab === 'culture' && country.cultural && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        {/* Flag Patch */}
                                        <div className="flex justify-center">
                                            <div className="relative p-6 bg-black/40 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                                                <div className="text-8xl filter drop-shadow-2xl grayscale-[0.2]">{country.cultural.flag}</div>
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black px-2 py-0.5 border border-white/20 text-[9px] font-mono text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                    OFFICIAL_STANDARD
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid gap-4">
                                            <div className="bg-white/[0.02] border border-white/10 p-4">
                                                <div className="flex items-center gap-2 mb-3 text-cyan-500 font-mono text-[10px] uppercase">
                                                    <Users className="w-3 h-3" /> Languages
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {country.cultural.officialLanguages.map((lang, i) => (
                                                        <span key={i} className="text-xs text-white font-mono px-2 py-1 bg-cyan-500/10 border border-cyan-500/20">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white/[0.02] border border-white/10 p-4">
                                                <div className="flex items-center gap-2 mb-3 text-amber-500 font-mono text-[10px] uppercase">
                                                    <BookOpen className="w-3 h-3" /> Religions
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {country.cultural.predominantReligions.map((rel, i) => (
                                                        <span key={i} className="text-xs text-white font-mono px-2 py-1 bg-amber-500/10 border border-amber-500/20">
                                                            {rel}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* HISTORY TAB */}
                                {activeTab === 'history' && country.historical && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        {country.historical.ancientCivilization && (
                                            <div className="bg-amber-950/10 border border-amber-500/20 p-4 flex items-center justify-between">
                                                <div>
                                                    <div className="text-[9px] text-amber-600 font-mono uppercase mb-1">Civilization Root</div>
                                                    <div className="text-xl text-amber-100 font-display font-bold tracking-wide">{country.historical.ancientCivilization}</div>
                                                </div>
                                                <Scroll className="w-8 h-8 text-amber-500/20" />
                                            </div>
                                        )}

                                        <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-cyan-500/50 before:via-cyan-500/10 before:to-transparent">
                                            {country.historical.pivotalEvents.map((event, i) => (
                                                <div key={i} className="relative pl-8">
                                                    {/* Timeline Node */}
                                                    <div className="absolute left-0 top-1 w-[10px] h-[10px] rounded-full bg-black border-2 border-cyan-500 z-10 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />

                                                    {/* Connector Line */}
                                                    <div className="absolute left-[9px] top-[6px] w-6 h-[1px] bg-cyan-500/30" />

                                                    <div className="bg-white/[0.02] border border-white/10 p-4 hover:border-white/20 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-lg font-bold text-white">{event.year}</span>
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-white/5 text-zinc-400 font-mono uppercase rounded">Historic Event</span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-cyan-100 mb-2">{event.title}</h4>
                                                        <p className="text-xs text-zinc-400 leading-relaxed font-mono">{event.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* GOVT TAB */}
                                {activeTab === 'govt' && country.government && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-cyan-950/20 to-transparent border-l-2 border-cyan-500">
                                            <User className="w-12 h-12 text-cyan-500/20 shrink-0" />
                                            <div>
                                                <div className="text-[9px] text-cyan-500 font-mono uppercase mb-1 tracking-widest">Head of State</div>
                                                <div className="text-2xl text-white font-display font-bold">{country.government.currentLeader}</div>
                                                <div className="text-xs text-zinc-500 font-mono mt-1">{country.government.governmentType}</div>
                                            </div>
                                        </div>

                                        {country.government.independence && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white/[0.02] border border-white/10 p-4">
                                                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-2">Founded</div>
                                                    <div className="text-lg text-white font-bold">{country.government.independence.date}</div>
                                                </div>
                                                <div className="bg-white/[0.02] border border-white/10 p-4">
                                                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-2">Origin</div>
                                                    <div className="text-lg text-white font-bold">{country.government.independence.from}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* --- FOOTER STATUS --- */}
                    <div className="px-[28px] py-3 border-t border-white/10 bg-black/60 backdrop-blur-sm flex justify-between items-center z-20">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${countryEvents.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className={`text-[9px] font-mono uppercase tracking-widest ${countryEvents.length > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                                {countryEvents.length > 0 ? 'THREAT_LEVEL: ELEVATED' : 'STATUS: STABLE'}
                            </span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 tracking-wider">
                            LAST_SYNC: {now.toLocaleTimeString('en-US', { hour12: false })}
                        </span>
                    </div>

                </div>

            </TacticalFrame >
        </div >
    );
}