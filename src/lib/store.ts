import { create } from 'zustand';
import { CountryData, GlobalEvent } from '@/data/schema';

interface OverseerState {
    focusedCountry: string | null;
    currentMode: 'DEFCON' | 'PLANETARY' | 'TRAFFIC' | 'MARKETS';
    news: any[];

    // GTI Intel
    globalEvents: GlobalEvent[];

    // Comparison Mode
    comparisonCountryId: string | null;
    isComparisonMode: boolean;

    setFocusedCountry: (countryId: string | null) => void;
    setComparisonCountry: (countryId: string | null) => void;
    setComparisonMode: (isActive: boolean) => void;
    setMode: (mode: OverseerState['currentMode']) => void;
    setNews: (news: any[]) => void;
    setGlobalEvents: (events: GlobalEvent[]) => void;
}

export const useStore = create<OverseerState>((set) => ({
    focusedCountry: null,
    currentMode: 'DEFCON',
    news: [],

    globalEvents: [],

    comparisonCountryId: null,
    isComparisonMode: false,

    setFocusedCountry: (countryId) => set({ focusedCountry: countryId }),
    setComparisonCountry: (countryId) => set({ comparisonCountryId: countryId }),
    setComparisonMode: (isActive) => set({ isComparisonMode: isActive }),
    setMode: (mode) => set({ currentMode: mode }),
    setNews: (news) => set({ news }),
    setGlobalEvents: (events) => set({ globalEvents: events }),
}));
