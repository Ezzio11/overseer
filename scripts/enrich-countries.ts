#!/usr/bin/env ts-node
/**
 * Country Data Enrichment Script
 * 
 * Fetches cultural and historical data from:
 * - REST Countries API (flags, languages, government)
 * - Wikipedia API (historical events, personalities)
 * - Curated local data (themes, cuisine)
 * 
 * Usage: npm run enrich-countries [country-code]
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

interface RestCountryData {
    name: { common: string; official: string };
    cca3: string;
    capital?: string[];
    languages?: Record<string, string>;
    religions?: string[];
    flag: string; // Emoji flag
    flags: { svg: string; png: string };
}

interface WikipediaExtract {
    title: string;
    extract: string;
}

// ============================================================================
// API Clients
// ============================================================================

/**
 * Fetch country data from REST Countries API
 */
async function fetchRestCountriesData(countryCode: string): Promise<RestCountryData | null> {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (!response.ok) {
            console.error(`❌ REST Countries API error for ${countryCode}: ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error(`❌ Failed to fetch REST Countries data for ${countryCode}:`, error);
        return null;
    }
}

/**
 * Fetch summary from Wikipedia
 */
async function fetchWikipediaSummary(countryName: string): Promise<WikipediaExtract | null> {
    try {
        const encodedName = encodeURIComponent(countryName);
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedName}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`❌ Wikipedia API error for ${countryName}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return {
            title: data.title,
            extract: data.extract,
        };
    } catch (error) {
        console.error(`❌ Failed to fetch Wikipedia data for ${countryName}:`, error);
        return null;
    }
}

// ============================================================================
// Curated Data (requires human touch)
// ============================================================================

const CURATED_THEMES: Record<string, {
    primaryColor: string;
    secondaryColor: string;
    backgroundType: 'desert' | 'forest' | 'ocean' | 'mountain' | 'urban' | 'tundra' | 'plains';
    atmosphereGradient: [string, string];
}> = {
    USA: { primaryColor: '#B22234', secondaryColor: '#3C3B6E', backgroundType: 'plains', atmosphereGradient: ['#1a1a2e', '#16213e'] },
    MEX: { primaryColor: '#006341', secondaryColor: '#CE1126', backgroundType: 'desert', atmosphereGradient: ['#8B4513', '#D2691E'] },
    EGY: { primaryColor: '#C09300', secondaryColor: '#000000', backgroundType: 'desert', atmosphereGradient: ['#8B7355', '#DEB887'] },
    CAN: { primaryColor: '#FF0000', secondaryColor: '#FFFFFF', backgroundType: 'tundra', atmosphereGradient: ['#E0F7FA', '#B3E5FC'] },
    BRA: { primaryColor: '#009739', secondaryColor: '#FEDD00', backgroundType: 'forest', atmosphereGradient: ['#0B5345', '#196F3D'] },
    JPN: { primaryColor: '#BC002D', secondaryColor: '#FFFFFF', backgroundType: 'mountain', atmosphereGradient: ['#424242', '#616161'] },
    AUS: { primaryColor: '#00008B', secondaryColor: '#FF0000', backgroundType: 'desert', atmosphereGradient: ['#8B4513', '#CD853F'] },
    DEU: { primaryColor: '#000000', secondaryColor: '#DD0000', backgroundType: 'urban', atmosphereGradient: ['#1a1a1a', '#2d2d2d'] },
    FRA: { primaryColor: '#0055A4', secondaryColor: '#EF4135', backgroundType: 'urban', atmosphereGradient: ['#191970', '#4169E1'] },
    GBR: { primaryColor: '#012169', secondaryColor: '#C8102E', backgroundType: 'ocean', atmosphereGradient: ['#0A1128', '#1A1A2E'] },
};

const CURATED_CUISINE: Record<string, string[]> = {
    USA: ['Hamburgers', 'Hot Dogs', 'Apple Pie', 'BBQ Ribs'],
    MEX: ['Tacos', 'Mole', 'Pozole', 'Tamales', 'Enchiladas'],
    EGY: ['Koshari', 'Ful Medames', 'Molokhia', 'Mahshi'],
    CAN: ['Poutine', 'Maple Syrup', 'Tourtière', 'Butter Tarts'],
    BRA: ['Feijoada', 'Pão de Queijo', 'Acarajé', 'Moqueca'],
    JPN: ['Sushi', 'Ramen', 'Tempura', 'Tonkatsu'],
    AUS: ['Meat Pie', 'Vegemite', 'Lamingtons', 'Pavlova'],
    DEU: ['Bratwurst', 'Sauerkraut', 'Pretzels', 'Schnitzel'],
    FRA: ['Croissant', 'Ratatouille', 'Coq au Vin', 'Crème Brûlée'],
    GBR: ['Fish and Chips', 'Shepherd\'s Pie', 'Roast Beef', 'Yorkshire Pudding'],
};

const CURATED_NATIONAL_ANIMALS: Record<string, string> = {
    USA: 'Bald Eagle',
    MEX: 'Golden Eagle',
    EGY: 'Steppe Eagle',
    CAN: 'Beaver',
    BRA: 'Jaguar',
    JPN: 'Green Pheasant',
    AUS: 'Red Kangaroo',
    DEU: 'Black Eagle',
    FRA: 'Gallic Rooster',
    GBR: 'Lion',
};

// ============================================================================
// Enrichment Logic
// ============================================================================

/**
 * Enrich a single country with cultural and historical data
 */
async function enrichCountry(countryCode: string): Promise<void> {
    console.log(`\n🔍 Enriching ${countryCode}...`);

    // Fetch from REST Countries API
    const restData = await fetchRestCountriesData(countryCode);
    if (!restData) {
        console.log(`⚠️  Skipping ${countryCode} - no API data available`);
        return;
    }

    console.log(`✅ Fetched REST Countries data for ${restData.name.common}`);

    // Fetch from Wikipedia
    const wikiData = await fetchWikipediaSummary(restData.name.common);
    if (wikiData) {
        console.log(`✅ Fetched Wikipedia summary`);
    }

    // Build enriched data object
    const enrichedData = {
        cultural: {
            flag: restData.flag,
            officialLanguages: restData.languages ? Object.values(restData.languages) : [],
            predominantReligions: restData.religions || [],
            nationalAnimal: CURATED_NATIONAL_ANIMALS[countryCode],
            famousCuisine: CURATED_CUISINE[countryCode] || [],
            famousLandmarks: [], // TODO: Scrape from Wikipedia
            popularGame: undefined,
        },
        historical: {
            ancientCivilization: undefined, // TODO: Extract from Wikipedia
            pivotalEvents: [], // TODO: Scrape historical events
            notableScientists: [],
            famousPersonalities: [],
            famousBooks: [],
        },
        government: {
            currentLeader: 'TBD', // Requires frequent updates
            governmentType: restData.name.official.includes('Republic') ? 'Republic' : 'Other',
            independence: undefined,
        },
        visualTheme: CURATED_THEMES[countryCode] || {
            primaryColor: '#00FFD9',
            secondaryColor: '#FF2A6D',
            backgroundType: 'plains' as const,
            atmosphereGradient: ['#1a1a2e', '#16213e'] as [string, string],
        },
    };

    console.log('\n📊 Enriched Data:');
    console.log(JSON.stringify(enrichedData, null, 2));
    console.log(`\n✨ ${countryCode} enrichment complete!`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('🌍 Enriching top 10 priority countries...\n');
        const priorityCountries = ['USA', 'MEX', 'JPN', 'DEU', 'FRA', 'GBR', 'CAN', 'BRA', 'EGY', 'AUS'];

        for (const code of priorityCountries) {
            await enrichCountry(code);
            // Rate limiting: wait 500ms between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else {
        // Enrich specific country
        await enrichCountry(args[0].toUpperCase());
    }

    console.log('\n\n🎉 All enrichments complete!');
}

main().catch(console.error);
