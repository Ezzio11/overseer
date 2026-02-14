import React from 'react';
import { useStore } from '@/lib/store';
import { COUNTRIES } from '@/data/countries';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export const ComparisonPanel = () => {
    const focusedId = useStore((state) => state.focusedCountry);
    const comparisonId = useStore((state) => state.comparisonCountryId);

    // Fallback if accessed without valid IDs
    if (!focusedId) return null;

    const c1 = COUNTRIES[focusedId];
    const c2 = comparisonId ? COUNTRIES[comparisonId] : null;

    // Helper to format values
    const formatVal = (val: number, type: 'currency' | 'percent' | 'count' | 'rank') => {
        if (type === 'currency') return val >= 1000 ? `$${(val / 1000).toFixed(1)}T` : `$${val.toFixed(1)}B`;
        if (type === 'percent') return `${val}%`;
        if (type === 'count') return val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString();
        if (type === 'rank') return `#${val}`;
        return val;
    };

    // Helper to render comparison row
    const MetricRow = ({ label, v1, v2, type, invertBetter = false }: { label: string, v1: number, v2: number, type: 'currency' | 'percent' | 'count' | 'rank', invertBetter?: boolean }) => {
        const diff = v1 - v2;
        const isBetter = invertBetter ? v1 < v2 : v1 > v2;
        const isEqual = v1 === v2;

        return (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 border-b border-white/5">
                {/* Country 1 (Left) */}
                <div className={`text-right font-mono ${isBetter ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {formatVal(v1, type)}
                </div>

                {/* Label (Center) */}
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider text-center w-24">
                    {label}
                </div>

                {/* Country 2 (Right) */}
                <div className={`text-left font-mono ${!isBetter && !isEqual ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {c2 ? formatVal(v2, type) : '-'}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col">
            {/* Header / Selector */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="text-right">
                    <div className="text-2xl font-black text-white">{c1.id}</div>
                    <div className="text-[10px] text-cyan-500 font-mono">{c1.name}</div>
                </div>

                <div className="text-zinc-600 font-mono text-xs">VS</div>

                <div className="text-left">
                    {c2 ? (
                        <>
                            <div className="text-2xl font-black text-white">{c2.id}</div>
                            <div className="text-[10px] text-cyan-500 font-mono">{c2.name}</div>
                        </>
                    ) : (
                        <div className="text-sm text-zinc-500 font-mono italic">Select Country...</div>
                    )}
                </div>
            </div>

            {/* Metrics Scroll Area */}
            {c2 && (
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    <div className="text-[10px] font-mono text-cyan-800 tracking-widest mb-2 mt-2 text-center">ECONOMY</div>
                    <MetricRow label="GDP Total" v1={c1.economy.gdp} v2={c2.economy.gdp} type="currency" />
                    <MetricRow label="GDP / Cap" v1={c1.economy.gdpPerCapita} v2={c2.economy.gdpPerCapita} type="count" />
                    <MetricRow label="Growth" v1={c1.economy.gdpGrowth} v2={c2.economy.gdpGrowth} type="percent" />
                    <MetricRow label="Inflation" v1={c1.economy.inflation} v2={c2.economy.inflation} type="percent" invertBetter />
                    <MetricRow label="Unempl." v1={c1.economy.unemployment} v2={c2.economy.unemployment} type="percent" invertBetter />

                    <div className="text-[10px] font-mono text-cyan-800 tracking-widest mb-2 mt-6 text-center">MILITARY</div>
                    <MetricRow label="Power Rank" v1={c1.military.globalFirepowerRank} v2={c2.military.globalFirepowerRank} type="rank" invertBetter />
                    <MetricRow label="Active Personnel" v1={c1.military.activePersonnel} v2={c2.military.activePersonnel} type="count" />
                    <MetricRow label="Spending %" v1={c1.military.defenseSpending} v2={c2.military.defenseSpending} type="percent" />

                    <div className="text-[10px] font-mono text-cyan-800 tracking-widest mb-2 mt-6 text-center">SOCIETY</div>
                    <MetricRow label="Population" v1={c1.demographics.population} v2={c2.demographics.population} type="count" />
                    <MetricRow label="HDI" v1={c1.social.hdi} v2={c2.social.hdi} type="count" />
                    <MetricRow label="Life Exp." v1={c1.demographics.lifeExpectancy} v2={c2.demographics.lifeExpectancy} type="count" />
                    <MetricRow label="Median Age" v1={c1.demographics.medianAge} v2={c2.demographics.medianAge} type="count" />
                </div>
            )}

            {!c2 && (
                <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono text-xs text-center p-8">
                    Select another country on the globe to compare data against {c1.name}.
                </div>
            )}
        </div>
    );
};
