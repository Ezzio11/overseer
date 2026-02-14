// USGS Earthquake API Service

export interface EarthquakeFeature {
    id: string;
    properties: {
        mag: number;
        place: string;
        time: number;
        url: string;
        detail: string;
        alert: string | null;
        type: string;
        title: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number, number]; // [longitude, latitude, depth]
    };
}

interface USGSResponse {
    type: 'FeatureCollection';
    metadata: {
        generated: number;
        url: string;
        title: string;
        status: number;
        api: string;
        count: number;
    };
    features: EarthquakeFeature[];
}

const USGS_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

export async function fetchLatestEarthquakes(): Promise<EarthquakeFeature[]> {
    try {
        const response = await fetch(USGS_FEED_URL, { next: { revalidate: 60 } }); // Cache for 60s
        if (!response.ok) {
            throw new Error(`USGS API Error: ${response.statusText}`);
        }
        const data: USGSResponse = await response.json();
        return data.features;
    } catch (error) {
        console.error('Failed to fetch earthquakes:', error);
        return [];
    }
}
