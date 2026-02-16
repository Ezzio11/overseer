#!/usr/bin/env ts-node
/**
 * AI-Powered Country Data Enrichment Script
 * 
 * Automatically enriches ALL 195 countries with:
 * - Cultural data (landmarks, cuisine, national animals)
 * - Historical data (events, scientists, personalities, books)
 * - Government data (current leader, type, independence)
 * - Visual themes (colors, background type)
 * 
 * Uses:
 * - REST Countries API for basic data
 * - Google Gemini AI for comprehensive enrichment
 * - File writing to update countries.ts directly
 * 
 * Usage: npx ts-node scripts/enrich-all-countries.ts [--resume]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const GEMINI_API_KEY = 'AIzaSyBeU-l7oLwgEHXiCWMu2aqH34KlD21hs2c';
const COUNTRIES_FILE_PATH = path.join(__dirname, '../src/data/countries.ts');
const PROGRESS_FILE_PATH = path.join(__dirname, '.enrichment-progress.json');
const AI_RATE_LIMIT_MS = 2000; // 2 seconds between AI calls
const MAX_RETRIES = 3;

interface ProgressState {
    completed: string[];
    failed: { code: string; error: string }[];
    lastUpdated: string;
    totalProcessed: number;
}

// ============================================================================
// REST Countries API
// ============================================================================

interface RestCountryData {
    name: { common: string; official: string };
    cca3: string;
    capital?: string[];
    languages?: Record<string, string>;
    flag: string;
    independent?: boolean;
}

async function fetchRestCountriesData(countryCode: string): Promise<RestCountryData | null> {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error(`❌ REST Countries API failed for ${countryCode}:`, error);
        return null;
    }
}

//============================================================================
// AI Enrichment with Gemini
// ============================================================================

async function enrichWithAI(countryName: string, countryCode: string): Promise<any> {
    const prompt = `You are a cultural and historical expert. Generate comprehensive data for ${countryName} (${countryCode}).

CRITICAL: Respond with ONLY valid JSON, no markdown, no code blocks, no extra text.

Generate this exact JSON structure:
{
  "famousLandmarks": ["landmark1", "landmark2", "landmark3", "landmark4"],
  "pivotalEvents": [
    {
      "year": 1776,
      "title": "Short event name",
      "description": "One sentence description",
      "impact": "One sentence about long-term impact"
    }
  ],
  "notableScientists": ["Scientist Name (key achievement)", "Scientist 2 (achievement)"],
  "famousPersonalities": ["Person Name (role/field)", "Person 2 (role)"],
  "famousBooks": ["Book Title (Author)", "Book 2 (Author)"],
  "ancientCivilization": "Ancient civilization name or null if none",
  "currentLeader": "Current head of state/government name (2024-2026)",
  "governmentType": "Specific government type (e.g., Constitutional Monarchy, Federal Republic)",
  "independenceDate": "Date of independence or null if never colonized",
  "independenceFrom": "Country gained independence from or null",
  "popularGame": "Most popular sport or game",
  "predominantReligions": ["Religion 1", "Religion 2"],
  "nationalAnimal": "National animal or symbol",
  "famousCuisine": ["Dish 1", "Dish 2", "Dish 3", "Dish 4"]
}

Rules:
1. Include 3-5 pivotal events, ordered chronologically
2. Include 2-4 notable scientists (if country has them)
3. Include 3-5 famous personalities (artists, writers, leaders)
4. Include 2-3 famous books/literary works
5. Use factual, accurate information only
6. Keep descriptions concise (max 20 words each)
7. For current leader, use the most recent information available
8. Return ONLY the JSON object, nothing else`;

    try {
        // Using Google's Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        // More aggressive cleaning - remove ALL markdown, code fences, and extra text
        let jsonText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/^[^{]*/, '') // Remove anything before first {
            .replace(/[^}]*$/, '') // Remove anything after last }
            .trim();

        // Debug output first few chars
        console.log(`📝 AI Response preview: ${jsonText.substring(0, 100)}...`);

        try {
            return JSON.parse(jsonText);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('📄 Raw text length:', text.length);
            console.error('📄 First 500 chars:', text.substring(0, 500));
            console.error('📄 Last 500 chars:', text.substring(text.length - 500));
            throw parseError;
        }
    } catch (error) {
        console.error(`❌ AI enrichment failed for ${countryName}:`, error);
        throw error;
    }
}

// ============================================================================
// Curated Data (Fallbacks and Themes)
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

function inferTheme(countryCode: string, countryName: string): any {
    // If we have curated theme, use it
    if (CURATED_THEMES[countryCode]) {
        return CURATED_THEMES[countryCode];
    }

    // Otherwise, infer based on region/geography
    // This is a simplification - you could enhance this
    return {
        primaryColor: '#00FFD9',
        secondaryColor: '#FF2A6D',
        backgroundType: 'plains' as const,
        atmosphereGradient: ['#1a1a2e', '#16213e'] as [string, string],
    };
}

// ============================================================================
// File Reading/Writing
// ============================================================================

function readCountriesFile(): string {
    return fs.readFileSync(COUNTRIES_FILE_PATH, 'utf-8');
}

function writeCountriesFile(content: string): void {
    fs.writeFileSync(COUNTRIES_FILE_PATH, content, 'utf-8');
}

function updateCountryInFile(countryCode: string, enrichedData: any): void {
    let content = readCountriesFile();

    // Find the country object
    const countryRegex = new RegExp(
        `("${countryCode}"\\s*:\\s*{[^}]*?"military"\\s*:\\s*{[^}]*?})`,
        's'
    );

    const match = content.match(countryRegex);
    if (!match) {
        console.error(`❌ Could not find ${countryCode} in countries.ts`);
        return;
    }

    // Build the enrichment fields to inject
    const enrichmentFields = `,
    "cultural": ${JSON.stringify(enrichedData.cultural, null, 6).replace(/\n/g, '\n    ')},
    "historical": ${JSON.stringify(enrichedData.historical, null, 6).replace(/\n/g, '\n    ')},
    "government": ${JSON.stringify(enrichedData.government, null, 6).replace(/\n/g, '\n    ')},
    "visualTheme": ${JSON.stringify(enrichedData.visualTheme, null, 6).replace(/\n/g, '\n    ')}`;

    // Replace the closing brace of the military object with our new fields + closing brace
    const updatedCountry = match[0] + enrichmentFields;

    content = content.replace(countryRegex, updatedCountry);

    writeCountriesFile(content);
    console.log(`✅ Updated ${countryCode} in countries.ts`);
}

// ============================================================================
// Progress Tracking
// ============================================================================

function loadProgress(): ProgressState {
    if (fs.existsSync(PROGRESS_FILE_PATH)) {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE_PATH, 'utf-8'));
    }
    return {
        completed: [],
        failed: [],
        lastUpdated: new Date().toISOString(),
        totalProcessed: 0,
    };
}

function saveProgress(progress: ProgressState): void {
    progress.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

// ============================================================================
// Main Enrichment Logic
// ============================================================================

async function enrichCountry(countryCode: string, progress: ProgressState): Promise<boolean> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Enriching ${countryCode} (${progress.totalProcessed + 1}/195)`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // 1. Fetch basic data from REST Countries API
        const restData = await fetchRestCountriesData(countryCode);
        if (!restData) {
            throw new Error('Failed to fetch REST Countries data');
        }

        console.log(`✅ Fetched REST Countries data for ${restData.name.common}`);

        // 2. Enrich with AI
        console.log(`🤖 Calling AI for comprehensive enrichment...`);
        const aiData = await enrichWithAI(restData.name.common, countryCode);
        console.log(`✅ AI enrichment complete`);

        // 3. Build complete enriched data object
        const enrichedData = {
            cultural: {
                flag: restData.flag,
                officialLanguages: restData.languages ? Object.values(restData.languages) : [],
                predominantReligions: aiData.predominantReligions || [],
                nationalAnimal: aiData.nationalAnimal || undefined,
                famousCuisine: aiData.famousCuisine || [],
                famousLandmarks: aiData.famousLandmarks || [],
                popularGame: aiData.popularGame || undefined,
            },
            historical: {
                ancientCivilization: aiData.ancientCivilization || undefined,
                pivotalEvents: aiData.pivotalEvents || [],
                notableScientists: aiData.notableScientists || [],
                famousPersonalities: aiData.famousPersonalities || [],
                famousBooks: aiData.famousBooks || [],
            },
            government: {
                currentLeader: aiData.currentLeader || 'TBD',
                governmentType: aiData.governmentType || 'Sovereign State',
                independence: (aiData.independenceDate && aiData.independenceFrom) ? {
                    date: aiData.independenceDate,
                    from: aiData.independenceFrom,
                } : undefined,
            },
            visualTheme: inferTheme(countryCode, restData.name.common),
        };

        // 4. Update countries.ts file
        updateCountryInFile(countryCode, enrichedData);

        // 5. Update progress
        progress.completed.push(countryCode);
        progress.totalProcessed++;
        saveProgress(progress);

        console.log(`\n✨ ${countryCode} enrichment complete!`);
        return true;

    } catch (error) {
        console.error(`\n❌ Failed to enrich ${countryCode}:`, error);
        progress.failed.push({ code: countryCode, error: String(error) });
        progress.totalProcessed++;
        saveProgress(progress);
        return false;
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
    console.log('🌍 AI-Powered Country Enrichment Script');
    console.log('========================================\n');

    const args = process.argv.slice(2);
    const resume = args.includes('--resume');

    // Load progress
    let progress = loadProgress();

    // Get all country codes from countries.ts
    const content = readCountriesFile();
    const countryCodeMatches = content.matchAll(/"([A-Z]{3})":\s*{/g);
    const allCountries = Array.from(countryCodeMatches, m => m[1]);

    console.log(`📊 Found ${allCountries.length} countries in countries.ts`);
    console.log(`✅ Already completed: ${progress.completed.length}`);
    console.log(`❌ Previously failed: ${progress.failed.length}\n`);

    // Filter out already completed
    const remaining = allCountries.filter(code => !progress.completed.includes(code));

    if (remaining.length === 0) {
        console.log('🎉 All countries already enriched!');
        return;
    }

    console.log(`⏭️  Remaining: ${remaining.length} countries\n`);
    console.log(`⏱️  Estimated time: ${Math.ceil(remaining.length * 5 / 60)} minutes\n`);

    const startTime = Date.now();

    // Process each country
    for (let i = 0; i < remaining.length; i++) {
        const code = remaining[i];

        await enrichCountry(code, progress);

        // Rate limiting (except for last country)
        if (i < remaining.length - 1) {
            console.log(`\n⏳ Waiting ${AI_RATE_LIMIT_MS / 1000}s before next country...`);
            await sleep(AI_RATE_LIMIT_MS);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 ENRICHMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n✅ Successfully enriched: ${progress.completed.length} countries`);
    console.log(`❌ Failed: ${progress.failed.length} countries`);
    console.log(`⏱️  Total time: ${elapsed} minutes\n`);

    if (progress.failed.length > 0) {
        console.log('Failed countries:');
        progress.failed.forEach(f => console.log(`  - ${f.code}: ${f.error}`));
    }
}

main().catch(console.error);
