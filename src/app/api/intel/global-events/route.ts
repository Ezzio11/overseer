import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 minutes cache (faster refresh)

interface NormalizedEvent {
    id: string;
    type: 'CONFLICT' | 'DISASTER' | 'PROTEST';
    coordinates: [number, number]; // [lat, lng]
    intensity: number;
    description: string;
    date: string;
}

async function fetchGDELT(): Promise<NormalizedEvent[]> {
    try {
        // Query for Conflict, Terror, and Protests
        // GKG GeoJSON API
        // Query for Conflict, Terror, and Protests + Expanded Intel (Military, Crisis, Politics)
        const response = await fetch('https://api.gdeltproject.org/api/v1/gkg_geojson?QUERY=(THEME:ARMEDCONFLICT OR THEME:TERROR OR THEME:Strike_Protest OR THEME:MILITARY OR THEME:POLITICAL_TURMOIL OR THEME:CRISISLEX_CRISISLEXREC OR THEME:WB_2433_CONFLICT_AND_VIOLENCE)&OUTPUTTYPE=geojson');

        if (!response.ok) return [];

        const data = await response.json();

        if (!data.features) return [];

        return data.features.map((f: any) => ({
            id: `gdelt-${f.properties.url || Math.random()}`,
            type: f.properties.name?.includes('Protest') ? 'PROTEST' : 'CONFLICT',
            coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]], // GeoJSON is Lng,Lat. We want Lat,Lng
            intensity: 5, // Baseline for GDELT
            description: f.properties.name || 'Conflict Event',
            date: new Date().toISOString() // GDELT usually current
        })).slice(0, 500); // Limit to 500 to prevent explosion
    } catch (e) {
        console.error("GDELT Fetch Error", e);
        return [];
    }
}

async function fetchEONET(): Promise<NormalizedEvent[]> {
    try {
        // Add 3-second timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=10', {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) return [];

        const data = await response.json();

        const events: NormalizedEvent[] = [];

        data.events.forEach((e: any) => {
            // EONET categories: Wildfires (8), Volcanoes (12), Severe Storms (10)
            const type = 'DISASTER';
            const latestGeom = e.geometry[e.geometry.length - 1]; // Get latest position

            events.push({
                id: e.id,
                type: 'DISASTER',
                coordinates: [latestGeom.coordinates[1], latestGeom.coordinates[0]],
                intensity: 8,
                description: e.title,
                date: latestGeom.date
            });
        });

        return events;
    } catch (e) {
        console.error("EONET Fetch Error (timeout or network issue - proceeding with GDELT only)", e);
        return [];
    }
}

export async function GET() {
    console.log("Fetching Intel...");
    const [gdeltEvents, eonetEvents] = await Promise.all([
        fetchGDELT(),
        fetchEONET()
    ]);

    const allEvents = [...gdeltEvents, ...eonetEvents];

    return NextResponse.json({
        events: allEvents,
        meta: {
            total: allEvents.length,
            sources: ['GDELT', 'NASA EONET'],
            timestamp: new Date().toISOString()
        }
    });
}
