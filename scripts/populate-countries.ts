import fs from 'fs';
import path from 'path';

// Helper to fetch JSON with timeout
async function fetchJson(url: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        return res.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

const MILITARY_DATA: Record<string, { rank: number; personnel: number; spending: number }> = {
    'USA': { rank: 1, personnel: 1390000, spending: 3.5 },
    'RUS': { rank: 2, personnel: 1320000, spending: 4.1 },
    'CHN': { rank: 3, personnel: 2035000, spending: 1.6 },
    'IND': { rank: 4, personnel: 1455000, spending: 2.4 },
    'KOR': { rank: 5, personnel: 555000, spending: 2.7 },
    'GBR': { rank: 6, personnel: 185000, spending: 2.2 },
    'JPN': { rank: 7, personnel: 247000, spending: 1.1 },
    'TUR': { rank: 8, personnel: 355000, spending: 1.3 },
    'PAK': { rank: 9, personnel: 654000, spending: 2.6 },
    'ITA': { rank: 10, personnel: 165000, spending: 1.5 },
    'FRA': { rank: 11, personnel: 200000, spending: 1.9 },
    'BRA': { rank: 12, personnel: 360000, spending: 1.1 },
    'IDN': { rank: 13, personnel: 400000, spending: 0.7 },
    'IRN': { rank: 14, personnel: 610000, spending: 2.5 },
    'EGY': { rank: 15, personnel: 440000, spending: 1.2 },
    'AUS': { rank: 16, personnel: 59000, spending: 1.9 },
    'ISR': { rank: 17, personnel: 170000, spending: 4.5 },
    'UKR': { rank: 18, personnel: 700000, spending: 33.0 },
    'DEU': { rank: 19, personnel: 184000, spending: 1.4 },
    'ESP': { rank: 20, personnel: 120000, spending: 1.2 },
};

async function run() {
    console.log('Loading Worldometers scraped data...');
    const wmPath = path.join(process.cwd(), 'scripts', 'worldometers-data.json');

    if (!fs.existsSync(wmPath)) {
        console.error('Error: worldometers-data.json not found. Run the scraper first.');
        process.exit(1);
    }

    const wmData = JSON.parse(fs.readFileSync(wmPath, 'utf8'));
    const validCodes = Object.keys(wmData);
    console.log(`Loaded ${validCodes.length} countries from Worldometers source.`);

    console.log('Fetching base geo-data...');
    // We still need mledoze/countries for static data like Lat/Lng, Capital, Currency codes
    // BUT we will only process countries that exist in wmData
    const baseData = await fetchJson('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');

    // Fetch GDP as fallback/supplement since we only scraped population page
    const gdpData = await fetchJson('https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-gdp.json').catch(() => []);

    const processedData: any = {};

    for (const country of baseData) {
        const code = country.cca3;

        // STRICT FILTER: Only include if we have Worldometers data
        if (!wmData[code]) continue;

        const name = country.name.common;
        const wm = wmData[code];

        // Merge GDP (keep using samayo/gdp for now as it's real data, until we scrape GDP page too)
        const gdpEntry = gdpData.find((g: any) => g.country === name || country.altSpellings?.includes(g.country));

        // Calculate GDP
        // If we have real GDP, use it. If not, estimate based on Worldometers Pop * $12k
        let gdpValue = gdpEntry ? gdpEntry.gdp : (wm.population * 12000);
        if (isNaN(gdpValue)) gdpValue = wm.population * 5000;

        const military = MILITARY_DATA[code] || {
            rank: 50 + Math.floor(Math.random() * 100),
            personnel: Math.floor(wm.population * 0.005), // 0.5% active duty
            spending: 1.2
        };

        processedData[code] = {
            id: code,
            name: name,
            capital: country.capital?.[0] || 'N/A',
            area: country.area || 0,
            politicalSystem: country.independent ? 'Sovereign State' : 'Territory',

            economy: {
                gdp: Math.max(1, Math.round(gdpValue / 1000000000)), // Billions
                gdpPerCapita: Math.round(gdpValue / (wm.population || 1)),
                gdpGrowth: wm.growthRate ? Number(wm.growthRate) : Number((Math.random() * 4 - 0.5).toFixed(1)), // Use WM growth if available
                unemployment: Number((Math.random() * 10 + 2).toFixed(1)),
                inflation: Number((Math.random() * 8 + 1).toFixed(1)),
                debtToGDP: Number((Math.random() * 90 + 20).toFixed(1)),
                tradeBalance: Number((Math.random() * 40 - 20).toFixed(1)),
                currency: (country.currencies && Object.keys(country.currencies).length > 0) ? Object.keys(country.currencies)[0] : 'UNK'
            },

            demographics: {
                population: wm.population, // SOURCE OF TRUTH
                medianAge: wm.medianAge || Math.floor(20 + Math.random() * 25),
                lifeExpectancy: wm.lifeExpectancy || Math.floor(60 + Math.random() * 25),
                birthRate: wm.birthRate || Math.floor(10 + Math.random() * 20),
                deathRate: wm.deathRate || Math.floor(5 + Math.random() * 10),
                uranizationRate: wm.urbanPopulation || Math.floor(30 + Math.random() * 60),
                literacyRate: 70 + Math.floor(Math.random() * 29) // 70-99%
            },

            infrastructure: {
                internetPenetration: 40 + Math.floor(Math.random() * 59), // 40-99%
                mobileSubscriptions: 80 + Math.floor(Math.random() * 60), // 80-140 per 100
                broadbandSpeed: 10 + Math.floor(Math.random() * 150), // 10-160 Mbps
                energyAccess: 60 + Math.floor(Math.random() * 40), // 60-100%
                renewableEnergy: Math.floor(Math.random() * 80), // 0-80%
                co2Emissions: Number((Math.random() * 15).toFixed(1))
            },

            social: {
                hdi: Number((0.5 + Math.random() * 0.45).toFixed(3)), // 0.500 - 0.950
                giniCoefficient: 25 + Math.floor(Math.random() * 40), // 25-65
                corruptionIndex: 20 + Math.floor(Math.random() * 70), // 20-90
                pressFreedomIndex: 20 + Math.floor(Math.random() * 70), // 20-90
                educationExpenditure: Number((2 + Math.random() * 6).toFixed(1)), // 2-8%
                healthExpenditure: Number((3 + Math.random() * 10).toFixed(1)) // 3-13%
            },

            military: {
                defenseSpending: military.spending,
                activePersonnel: military.personnel,
                globalFirepowerRank: military.rank
            }
        };
    }

    const fileContent = `import { CountryDataset } from './schema';

export const COUNTRIES: CountryDataset = ${JSON.stringify(processedData, null, 2)};
`;

    const outputPath = path.join(process.cwd(), 'src', 'data', 'countries.ts');
    fs.writeFileSync(outputPath, fileContent);
    console.log(`Generated data for ${Object.keys(processedData).length} countries at ${outputPath}`);
}

run().catch(console.error);
