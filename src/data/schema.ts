

export interface EconomicMetrics {
    gdp: number;              // Billions USD
    gdpPerCapita: number;     // USD
    gdpGrowth: number;        // % annual
    unemployment: number;     // %
    inflation: number;        // %
    debtToGDP: number;        // %
    tradeBalance: number;     // Billions USD (Positive = Surplus, Negative = Deficit)
    currency: string;         // e.g., "USD", "EUR"
}

export interface DemographicMetrics {
    population: number;
    medianAge: number;        // years
    lifeExpectancy: number;   // years
    birthRate: number;        // per 1000
    deathRate: number;        // per 1000
    urbanizationRate: number;  // %
    literacyRate: number;     // %
}

export interface InfrastructureMetrics {
    internetPenetration: number;      // %
    mobileSubscriptions: number;      // per 100 people
    broadbandSpeed: number;           // Mbps avg
    energyAccess: number;             // % of population
    renewableEnergy: number;          // % of total capacity
    co2Emissions: number;             // metric tons per capita
}

export interface SocialMetrics {
    hdi: number;              // Human Development Index 0-1
    giniCoefficient: number;  // 0-100 (inequality, higher is worse)
    corruptionIndex: number;  // 0-100 (100 = cleanest)
    pressFreedomIndex: number; // 0-100 (100 = best)
    educationExpenditure: number; // % of GDP
    healthExpenditure: number;    // % of GDP
}

export interface MilitaryMetrics {
    defenseSpending: number;          // % of GDP
    activePersonnel: number;          // count
    globalFirepowerRank: number;      // 1 = strongest
}

export interface CulturalMetrics {
    flag: string;                     // Emoji flag (🇺🇸) or SVG path
    officialLanguages: string[];      // e.g., ["English", "Spanish"]
    predominantReligions: string[];   // e.g., ["Christianity", "Islam"]
    nationalAnimal?: string;          // e.g., "Bald Eagle"
    famousCuisine: string[];          // e.g., ["Hamburgers", "Apple Pie"]
    famousLandmarks: string[];        // e.g., ["Statue of Liberty", "Grand Canyon"]
    popularGame?: string;             // Most played game/sport
}

export interface PivotalEvent {
    year: number;
    title: string;
    description: string;
    impact: string;                   // Long-term impact on the nation
}

export interface HistoricalMetrics {
    ancientCivilization?: string;     // e.g., "Roman Empire", "Aztec Empire"
    pivotalEvents: PivotalEvent[];    // Major historical moments
    notableScientists: string[];      // Famous scientists from this country
    famousPersonalities: string[];    // Artists, writers, leaders
    famousBooks: string[];            // Literary works
}

export interface GovernmentMetrics {
    currentLeader: string;            // Name of current head of state
    governmentType: string;           // e.g., "Constitutional Monarchy", "Presidential Republic"
    independence?: {
        date: string;                 // e.g., "July 4, 1776"
        from: string;                 // e.g., "British Empire"
    };
}

export interface VisualTheme {
    primaryColor: string;             // Hex color from flag
    secondaryColor: string;           // Accent color
    backgroundType: 'desert' | 'forest' | 'ocean' | 'mountain' | 'urban' | 'tundra' | 'plains';
    atmosphereGradient: [string, string]; // [start, end] gradient colors
}

export interface GlobalEvent {
    id: string;
    type: 'CONFLICT' | 'DISASTER' | 'PROTEST' | 'CYBERATTACK' | 'TERRORISM';
    coordinates: [number, number]; // [lat, lng]
    intensity: number; // 1-10
    description: string;
    date: string;

    // Enhanced Intel Fields
    countryId?: string;           // ISO 3166-1 alpha-3 code for direct country linking
    casualties?: {
        confirmed: number;
        estimated: number;
        civilian: number;
        military?: number;
    };
    damage?: {
        economic: number;         // USD millions
        infrastructure: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
        affectedPopulation: number;
    };
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    affectedZones?: string[];     // Cities, regions affected
    source: string;               // e.g., "USGS", "CIA", "UN", "Local Agency"
    verified: boolean;            // Intel verification status
    updateCount?: number;         // How many times this event has been updated
}

export interface SecurityMetrics {
    gti: number;              // 0-100 Global Tension Index
}

export interface CountryData {
    id: string;              // ISO 3166-1 alpha-3 code
    name: string;
    capital: string;
    area: number;            // sq km
    politicalSystem: string;

    // New Categorization Fields
    region: string;           // e.g., "Western Europe", "South Asia"
    continent: string;        // e.g., "Europe", "Asia"
    incomeLevel?: string;     // e.g., "High Income", "Low Income"
    developmentStatus?: string; // e.g., "Developed", "Developing"

    // Dynamic Intel
    activeEvents?: GlobalEvent[]; // Real-time events matched to this country

    // Categorized Metrics
    economy: EconomicMetrics;
    demographics: DemographicMetrics;
    infrastructure: InfrastructureMetrics;
    social: SocialMetrics;
    security: SecurityMetrics;
    military: MilitaryMetrics;

    // Enhanced Cultural & Historical Data
    cultural?: CulturalMetrics;
    historical?: HistoricalMetrics;
    government?: GovernmentMetrics;
    visualTheme?: VisualTheme;
}

// Map of Country Code -> Data
export type CountryDataset = Record<string, CountryData>;
