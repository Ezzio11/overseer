export const formatCurrency = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(2)}T`;
    return `$${val.toFixed(2)}B`;
};

export const formatPerCapita = (val: number) => {
    return `$${val.toLocaleString()}`;
};

export const formatPercent = (val: number) => {
    return `${val.toFixed(1)}%`;
};

export const formatLargeNumber = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString();
};

export const formatRank = (val: number) => {
    return `#${val}`;
};
