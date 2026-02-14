import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { WORLDOMETERS_SLUGS } from './slug-map';

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCountry(page: any, code: string, slug: string) {
    const url = `https://www.worldometers.info/world-population/${slug}-population/`;
    console.log(`Scraping ${code}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        // Shorter timeout for selector - if it's not there quickly, it might be a bad page
        try {
            await page.waitForSelector('.rts-counter', { timeout: 5000 });
        } catch (e) {
            // Continue anyway, maybe table data exists even if counter fails
        }
        await delay(500);

        // Extract population from .rts-counter
        const population = await page.$eval('.rts-counter', (el: any) => {
            const text = el.textContent || '';
            return parseInt(text.replace(/,/g, '')) || 0;
        }).catch(() => 0);

        // Extract table data
        const tableData = await page.evaluate(() => {
            const result: any = {};
            const rows = document.querySelectorAll('tr');

            rows.forEach((row: any) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const label = cells[0].textContent?.trim().toLowerCase() || '';
                    const valueText = cells[1].textContent?.trim() || '';
                    const numVal = parseFloat(valueText.replace(/[^\d.-]/g, '')) || 0;

                    if (label.includes('yearly change')) result.growthRate = numVal;
                    if (label.includes('median age')) result.medianAge = numVal;
                    if (label.includes('urban pop')) result.urbanPopulation = numVal;
                    if (label.includes('fert')) result.fertilityRate = numVal;
                    if (label.includes('density')) result.density = numVal;
                }
            });

            return result;
        });

        const pageText = await page.evaluate(() => document.body.textContent || '');

        const lifeExpMatch = pageText.match(/life\s*expectancy[:\s]*(\d+\.?\d*)/i);
        const lifeExpectancy = lifeExpMatch ? parseFloat(lifeExpMatch[1]) : 0;

        const birthMatch = pageText.match(/(\d+\.?\d*)\s*(births?\s*per|birth\s*rate)/i);
        const birthRate = birthMatch ? parseFloat(birthMatch[1]) : 0;

        const deathMatch = pageText.match(/(\d+\.?\d*)\s*(deaths?\s*per|death\s*rate)/i);
        const deathRate = deathMatch ? parseFloat(deathMatch[1]) : 0;

        const result = {
            population,
            growthRate: tableData.growthRate || 0,
            birthRate,
            deathRate,
            lifeExpectancy,
            medianAge: tableData.medianAge || 0,
            urbanPopulation: tableData.urbanPopulation || 0,
            fertilityRate: tableData.fertilityRate || 0,
            density: tableData.density || 0
        };

        console.log(`✓ ${code}: Pop=${(population / 1000000).toFixed(1)}M, LE=${lifeExpectancy}`);
        return result;

    } catch (err) {
        console.error(`✗ ${code}: ${err instanceof Error ? err.message : String(err)}`);
        return null;
    }
}

async function main() {
    console.log('🌍 Worldometers Scraper: Full Scale Run\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    // Set a realistic viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Set User Agent to avoid bot detection (though robots.txt is permissible, WAF might block)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const results: Record<string, any> = {};
    let successCount = 0;
    // Load existing data if restart
    const outputPath = path.join(process.cwd(), 'scripts', 'worldometers-data.json');
    if (fs.existsSync(outputPath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            Object.assign(results, existing);
            console.log(`Loaded ${Object.keys(results).length} existing records.`);
        } catch (e) { }
    }

    const slugs = Object.entries(WORLDOMETERS_SLUGS);
    console.log(`Targeting ${slugs.length} countries...`);

    for (const [code, slug] of slugs) {
        if (results[code]) {
            console.log(`Skipping ${code} (Already fetched)`);
            continue;
        }

        const data = await scrapeCountry(page, code, slug);
        if (data && (data.population > 0 || data.lifeExpectancy > 0)) {
            results[code] = data;
            successCount++;
            // Save incrementally
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        }

        // Rate limiting: Random delay 1s - 3s
        const waitTime = 1000 + Math.random() * 2000;
        await delay(waitTime);
    }

    await browser.close();
    console.log(`\n✅ Run Complete. Total: ${Object.keys(results).length} countries`);
}

main().catch(console.error);
