import { EarthquakeFeature } from "./usgs";

// GDELT Geo 2.0 API Service

export interface NewsFeature {
    id: string; // URL as ID
    properties: {
        title: string;
        url: string;
        time: string;
        image?: string;
        domain: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
}

interface GdeltFeature {
    type: 'Feature';
    properties: {
        name: string; // "Country" or "City, Country"
        count: number;
        shareimage?: string;
        html: string; // Contains <a> tags with news links
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

interface GdeltResponse {
    type: 'FeatureCollection';
    features: GdeltFeature[];
}

const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/geo/geo?query=sourcelang:eng&format=geojson&timespan=24h';

// Helper to extract the first valid news item from GDELT's HTML blob
const parseGdeltHtml = (html: string): { title: string; url: string; domain: string } | null => {
    if (!html) return null;
    // Basic regex to find the first <a href="...">Title</a>
    // <a href="URL" title="TITLE" target="_blank">TITLE</a>
    const linkRegex = /<a href="([^"]+)" title="([^"]+)"/;
    const match = html.match(linkRegex);

    if (match && match[1] && match[2]) {
        const url = match[1];
        const title = match[2];
        try {
            const hostname = new URL(url).hostname.replace('www.', '');
            return { title, url, domain: hostname };
        } catch (e) {
            return { title, url, domain: 'unknown' };
        }
    }
    return null;
};

export async function fetchLatestNews(): Promise<NewsFeature[]> {
    try {
        const response = await fetch(GDELT_API_URL, { next: { revalidate: 300 } }); // Cache for 5 mins
        if (!response.ok) {
            console.error(`GDELT API Error: ${response.statusText}`);
            return [];
        }

        const data: GdeltResponse = await response.json();
        const newsItems: NewsFeature[] = [];

        // GDELT returns locations, each with MULTIPLE news items in the 'html' property.
        // We will extract the top news item from each meaningful location.

        data.features.forEach(feat => {
            const extracted = parseGdeltHtml(feat.properties.html);
            if (extracted) {
                // Determine reliability? For now just take items with images or high counts
                newsItems.push({
                    id: extracted.url, // Use URL as unique ID
                    properties: {
                        title: extracted.title,
                        url: extracted.url,
                        time: new Date().toISOString(), // GDELT GeoJSON doesn't give exact time per article, so we assume "Recent"
                        image: feat.properties.shareimage,
                        domain: extracted.domain
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [feat.geometry.coordinates[0], feat.geometry.coordinates[1]]
                    }
                });
            }
        });

        // Limit to top 100 citations to avoid globe clutter but provide enough for ticker
        return newsItems.slice(0, 100);

    } catch (error) {
        console.error('Failed to fetch GDELT news:', error);
        return [];
    }
}
