import React from 'react';
import { AnimatedNumber } from "./AnimatedNumber";

// Formatter Helpers
const formatCurrency = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(2)}T`;
    return `$${val.toFixed(2)}B`;
};

const formatPercent = (val: number) => {
    return `${val.toFixed(1)}%`;
};

const formatLargeNumber = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString();
};

const formatRank = (val: number) => {
    return `#${val}`;
};



export interface MetricsTabProps {
    data: Record<string, any>;
    category: string;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({ data, category }) => {
    const formatValue = (key: string, value: any) => {
        const k = key.toLowerCase();

        if (typeof value !== 'number') return value;

        // Currency (GDP, Trade)
        if ((k.includes('gdp') && !k.includes('growth') && !k.includes('debt')) || k.includes('trade')) {
            return <AnimatedNumber value={value} format={formatCurrency} />;
        }

        // Percentages
        if (k.includes('growth') || k.includes('rate') || k.includes('inflation') || k.includes('unemployment') || k.includes('penetration') || k.includes('access') || k.includes('renewable') || k.includes('expenditure') || k.includes('debt')) {
            return <AnimatedNumber value={value} format={formatPercent} />;
        }

        // Large Counts
        if (key === 'population' || key === 'activePersonnel') {
            return <AnimatedNumber value={value} format={formatLargeNumber} />;
        }

        // Ranks
        if (k.includes('rank')) {
            return <AnimatedNumber value={value} format={formatRank} />;
        }

        return <AnimatedNumber value={value} format={(v) => v.toLocaleString()} />;
    };

    const formatKeyLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').toUpperCase();
    };

    const getSemanticColor = (key: string, value: any) => {
        const k = key.toLowerCase();
        if (typeof value !== 'number') return 'text-white';

        // Good if High
        const goodIfHigh = ['gdp', 'growth', 'life', 'literacy', 'speed', 'access', 'renewable', 'hdi', 'freedom'];
        if (goodIfHigh.some(term => k.includes(term))) {
            // Contextual thresholds (simplified)
            if (k.includes('growth') && value < 0) return 'text-[var(--color-alert)]'; // Negative growth is bad
            if (k.includes('growth') && value > 2) return 'text-[var(--color-success)]';
            if (k.includes('literacy') && value > 90) return 'text-[var(--color-success)]';
            if (k.includes('literacy') && value < 60) return 'text-[var(--color-alert)]';
            return 'text-white';
        }

        // Good if Low
        const goodIfLow = ['unemployment', 'inflation', 'debt', 'corruption', 'death', 'emissions', 'gti']; // Corruption index: usually higher is better (cleaner)? Verify. 
        // CPI: 100 is very clean, 0 is highly corrupt. So corruptionIndex map: usually "Corruption Perceptions Index", higher is better.
        // If the data is "Corruption Index" closer to 100 means LESS corrupt.
        // Let's assume standard CPI.

        if (k.includes('unemployment')) {
            if (value < 5) return 'text-[var(--color-success)]';
            if (value > 10) return 'text-[var(--color-alert)]';
        }
        if (k.includes('inflation')) {
            if (value < 3) return 'text-[var(--color-success)]';
            if (value > 8) return 'text-[var(--color-alert)]';
        }

        return 'text-white';
    };


    // FILTER REDUNDANT DATA
    // If category is 'demographics', remove keys that are already shown in the top cards
    const filteredData = { ...data };
    if (category === 'demographics') {
        delete (filteredData as any).population;
        delete (filteredData as any).lifeExpectancy;
        delete (filteredData as any).medianAge;
    }

    const entries = Object.entries(filteredData);

    return (
        <div className="animate-in fade-in duration-200">
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyan-500/10">
                <div className="w-1 h-3 bg-cyan-500 rounded-sm shadow-[0_0_8px_cyan]" />
                <h4 className="font-mono text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase">
                    {category} METRICS
                </h4>
                <span className="text-[10px] font-mono text-cyan-800 ml-auto">{entries.length} FIELDS</span>
            </div>

            {/* STRUCTURED ROWS - MAX BREATHING ROOM */}
            <div className="space-y-4">
                {entries.map(([key, value], i) => {
                    const k = key.toLowerCase();
                    const semanticColor = getSemanticColor(key, value);

                    return (
                        <div
                            key={key}
                            className="grid grid-cols-[1fr_auto] gap-3 items-baseline group py-3 px-3 hover:bg-white/[0.02] transition-colors rounded mb-1 border-b border-white/5 last:border-0"
                        >
                            <span className="text-sm font-mono text-cyan-500/70 tracking-widest uppercase truncate pr-4">
                                {formatKeyLabel(key)}
                            </span>

                            {/* Dotted Leader - Removed for cleaner grid look, using border-b on row instead */}

                            <span className={`text-base font-mono font-bold tabular-nums whitespace-nowrap text-right ${semanticColor} ${semanticColor !== 'text-white' ? 'drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]' : ''}`}>
                                {formatValue(key, value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
