

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
}

// Map of Country Code -> Data
export type CountryDataset = Record<string, CountryData>;
