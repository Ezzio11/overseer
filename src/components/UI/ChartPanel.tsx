"use client";

import { useStore } from "@/lib/store";
import { COUNTRIES } from "@/data/countries";
import { Area, AreaChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TacticalFrame } from "./TacticalFrame";

export default function ChartPanel() {
    const focusedId = useStore((state) => state.focusedCountry);
    const country = focusedId ? COUNTRIES[focusedId] : null;

    if (!country) return null;

    // GDP history data
    const baseGdp = country.economy.gdp;
    const growth = parseFloat(String(country.economy.gdpGrowth));
    const gdpHistory = Array.from({ length: 6 }, (_, i) => {
        const year = 2020 + i;
        const factor = 1 + (growth / 100) * (i - 5);
        return { year, gdp: Math.round(baseGdp * factor) };
    });

    // Radar data
    const allCountries = Object.values(COUNTRIES);
    const globalAvg = {
        hdi: allCountries.reduce((sum, c) => sum + c.social.hdi, 0) / allCountries.length * 100,
        literacy: allCountries.reduce((sum, c) => sum + c.demographics.literacyRate, 0) / allCountries.length,
        urban: allCountries.reduce((sum, c) => sum + c.demographics.urbanizationRate, 0) / allCountries.length,
        internet: allCountries.reduce((sum, c) => sum + c.infrastructure.internetPenetration, 0) / allCountries.length,
        freedom: allCountries.reduce((sum, c) => sum + c.social.pressFreedomIndex, 0) / allCountries.length,
    };

    const radarData = [
        { subject: 'HDI', A: country.social.hdi * 100, B: Math.round(globalAvg.hdi), fullMark: 100 },
        { subject: 'Literacy', A: country.demographics.literacyRate, B: Math.round(globalAvg.literacy), fullMark: 100 },
        { subject: 'Urban', A: country.demographics.urbanizationRate, B: Math.round(globalAvg.urban), fullMark: 100 },
        { subject: 'Internet', A: country.infrastructure.internetPenetration, B: Math.round(globalAvg.internet), fullMark: 100 },
        { subject: 'Freedom', A: country.social.pressFreedomIndex, B: Math.round(globalAvg.freedom), fullMark: 100 },
    ];

    // Economic Indicators
    const economics = [
        {
            label: 'GDP / CAPITA',
            value: `$${country.economy.gdpPerCapita.toLocaleString()}`,
            sub: 'USD',
            color: 'text-white/90'
        },
        {
            label: 'UNEMPLOYMENT',
            value: `${country.economy.unemployment}%`,
            sub: '',
            color: country.economy.unemployment > 10 ? 'text-red-500' : 'text-emerald-400'
        },
        {
            label: 'INFLATION',
            value: `${country.economy.inflation}%`,
            sub: '',
            color: country.economy.inflation > 10 ? 'text-red-500' : 'text-amber-400'
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
            <TacticalFrame title="ECONOMIC INTELLIGENCE" className="h-full pointer-events-auto">
                <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2 p-1">

                    {/* SECTOR SCANNER — GDP TREND */}
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono text-zinc-500 tracking-widest">GDP FORECAST (5YR)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-600">GROWTH</span>
                                <span className={`text-xs font-mono font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {growth > 0 ? '+' : ''}{growth}%
                                </span>
                            </div>
                        </div>
                        <div className="h-[180px] w-full bg-black/40 border border-white/[0.08] p-2 relative">
                            {/* Grid Lines Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={gdpHistory}>
                                    <defs>
                                        <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={growth >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={growth >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px' }}
                                        itemStyle={{ color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                                        labelStyle={{ color: '#71717a', fontFamily: 'monospace', fontSize: '10px' }}
                                        formatter={(value: any) => [`$${(value / 1).toLocaleString()}B`, 'GDP']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="gdp"
                                        stroke={growth >= 0 ? "#10b981" : "#ef4444"}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorGdp)"
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ECONOMIC SNAPSHOT GRID */}
                    <div>
                        <span className="text-[10px] font-mono text-zinc-500 tracking-widest block mb-2">ECONOMIC SNAPSHOT</span>
                        <div className="grid grid-cols-2 gap-2">
                            {economics.map((stat, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between hover:bg-white/[0.05] transition-colors group">
                                    <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">{stat.label}</span>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className={`text-lg font-mono font-bold ${stat.color} tracking-tight`}>{stat.value}</span>
                                        {stat.sub && <span className="text-[10px] text-zinc-600 font-mono">{stat.sub}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RADAR — DEVELOPMENT METRICS */}
                    <div className="flex-grow flex flex-col min-h-[220px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono text-zinc-500 tracking-widest">DEVELOPMENT MATRIX</span>
                        </div>
                        <div className="flex-grow w-full bg-black/40 border border-white/[0.08] relative min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }} />

                                    <Radar
                                        name={country.name}
                                        dataKey="A"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        fill="#06b6d4"
                                        fillOpacity={0.15}
                                    />
                                    <Radar
                                        name="Global Avg"
                                        dataKey="B"
                                        stroke="#71717a"
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                        fill="transparent"
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}
                                        iconSize={8}
                                        formatter={(value) => <span className="text-zinc-400">{value}</span>}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '11px', fontFamily: 'monospace' }}
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
