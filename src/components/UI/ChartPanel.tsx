"use client";

import { useStore } from "@/lib/store";
import { COUNTRIES } from "@/data/countries";
import { Area, AreaChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TacticalFrame } from "./TacticalFrame";

export default function ChartPanel() {
    const focusedId = useStore((state) => state.focusedCountry);
    const country = focusedId ? COUNTRIES[focusedId] : null;

    if (!country) return null;

    // --- DATA PREP ---

    // 1. GDP Projection (Linear extrapolation based on growth rate)
    const baseGdp = country.economy.gdp;
    const growth = parseFloat(String(country.economy.gdpGrowth));
    const isPositive = growth >= 0;
    const chartColor = isPositive ? "#10b981" : "#ef4444"; // Emerald or Red

    const gdpHistory = Array.from({ length: 6 }, (_, i) => {
        const year = 2020 + i;
        // Simple compound growth formula
        const factor = Math.pow(1 + (growth / 100), i);
        return {
            year,
            gdp: Math.round(baseGdp * factor),
            // Add a "forecast" flag for future years (visual distinction)
            isForecast: year > new Date().getFullYear()
        };
    });

    // 2. Radar Comparison Data
    const allCountries = Object.values(COUNTRIES);
    const globalAvg = {
        hdi: allCountries.reduce((sum, c) => sum + c.social.hdi, 0) / allCountries.length,
        literacy: allCountries.reduce((sum, c) => sum + c.demographics.literacyRate, 0) / allCountries.length,
        urban: allCountries.reduce((sum, c) => sum + c.demographics.urbanizationRate, 0) / allCountries.length,
        internet: allCountries.reduce((sum, c) => sum + c.infrastructure.internetPenetration, 0) / allCountries.length,
        freedom: allCountries.reduce((sum, c) => sum + c.social.pressFreedomIndex, 0) / allCountries.length,
    };

    const radarData = [
        { subject: 'HDI', A: country.social.hdi * 100, B: Math.round(globalAvg.hdi * 100), fullMark: 100 },
        { subject: 'Literacy', A: country.demographics.literacyRate, B: Math.round(globalAvg.literacy), fullMark: 100 },
        { subject: 'Urban', A: country.demographics.urbanizationRate, B: Math.round(globalAvg.urban), fullMark: 100 },
        { subject: 'Internet', A: country.infrastructure.internetPenetration, B: Math.round(globalAvg.internet), fullMark: 100 },
        { subject: 'Freedom', A: country.social.pressFreedomIndex, B: Math.round(globalAvg.freedom), fullMark: 100 },
    ];

    // 3. Economic KPI Grid
    const economics = [
        {
            label: 'GDP / CAPITA',
            value: `$${country.economy.gdpPerCapita.toLocaleString()}`,
            sub: 'USD',
            color: 'text-white'
        },
        {
            label: 'UNEMPLOYMENT',
            value: `${country.economy.unemployment}%`,
            sub: null,
            // Dynamic coloring based on thresholds
            color: country.economy.unemployment > 10 ? 'text-red-500' : (country.economy.unemployment > 5 ? 'text-amber-400' : 'text-emerald-400')
        },
        {
            label: 'INFLATION',
            value: `${country.economy.inflation}%`,
            sub: null,
            color: country.economy.inflation > 8 ? 'text-red-500' : (country.economy.inflation > 3 ? 'text-amber-400' : 'text-emerald-400')
        },
        {
            label: 'TRADE BAL.',
            value: `${country.economy.tradeBalance > 0 ? '+' : ''}${country.economy.tradeBalance}B`,
            sub: 'USD',
            color: country.economy.tradeBalance >= 0 ? 'text-emerald-400' : 'text-red-500'
        },
    ];

    return (
        <div className="w-full h-full flex flex-col pointer-events-none">
            <TacticalFrame title="ECONOMIC INTELLIGENCE" className="h-full pointer-events-auto bg-black/80 backdrop-blur-md">
                <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar p-1 pr-2">

                    {/* --- MODULE 1: GDP TREND (AREA CHART) --- */}
                    <div className="relative group">
                        {/* Header Row */}
                        <div className="flex justify-between items-end mb-2 border-b border-white/5 pb-1">
                            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">GDP Forecast (5yr)</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-zinc-600 uppercase">Growth</span>
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 border ${isPositive ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                    <span className={`font-mono text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isPositive ? '+' : ''}{growth}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="h-[160px] w-full bg-black/20 border-l border-b border-white/10 relative">
                            {/* Background Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                            {/* Scanline Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8))] pointer-events-none z-10" />

                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={gdpHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        tick={{ fill: 'rgba(113, 113, 122, 1)', fontSize: 9, fontFamily: 'monospace' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={5}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 0 }}
                                        itemStyle={{ color: '#fff', fontFamily: 'monospace', fontSize: '10px' }}
                                        labelStyle={{ color: '#666', fontFamily: 'monospace', fontSize: '9px', marginBottom: '2px' }}
                                        formatter={(value: any) => [`$${(value / 1).toLocaleString()}B`, 'GDP']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="gdp"
                                        stroke={chartColor}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorGdp)"
                                        isAnimationActive={true}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- MODULE 2: KPI GRID --- */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-1 bg-zinc-500 rounded-full" />
                            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Economic Snapshot</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 border border-white/5">
                            {economics.map((stat, i) => (
                                <div key={i} className="bg-black/40 p-3 hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/10 group">
                                    <span className="block font-mono text-[9px] text-zinc-500 group-hover:text-cyan-500 transition-colors uppercase mb-1">
                                        {stat.label}
                                    </span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`font-display text-xl font-bold tracking-tight ${stat.color}`}>
                                            {stat.value}
                                        </span>
                                        {stat.sub && (
                                            <span className="font-mono text-[9px] text-zinc-600">{stat.sub}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- MODULE 3: DEVELOPMENT MATRIX (RADAR) --- */}
                    <div className="flex-grow flex flex-col min-h-[240px]">
                        <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
                            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Development Matrix</span>
                            <span className="font-mono text-[9px] text-zinc-700">HDT</span>
                        </div>

                        <div className="flex-grow w-full bg-black/20 border border-white/5 relative p-2">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" gridType="polygon" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }}
                                    />

                                    {/* Country Data (The "Glow") */}
                                    <Radar
                                        name={country.name}
                                        dataKey="A"
                                        stroke="#06b6d4" // Cyan-500
                                        strokeWidth={2}
                                        fill="#06b6d4"
                                        fillOpacity={0.2}
                                    />

                                    {/* Global Average (The "Benchmark") */}
                                    <Radar
                                        name="Global Avg"
                                        dataKey="B"
                                        stroke="#52525b" // Zinc-600
                                        strokeWidth={1}
                                        strokeDasharray="3 3"
                                        fill="transparent"
                                    />

                                    <Legend
                                        wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: '10px' }}
                                        iconSize={6}
                                        formatter={(val) => <span className="text-zinc-400 uppercase">{val}</span>}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', fontFamily: 'monospace' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </TacticalFrame>
        </div>
    );
}