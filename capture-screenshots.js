import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        // Screenshot 1: Dashboard Lead
        console.log('📸 Catturando Dashboard Lead...');
        const dashboardPath = path.join(__dirname, 'screenshots', 'dashboard-lead-preview.html');
        await page.goto(`file://${dashboardPath}`);
        await page.waitForTimeout(1000); // Wait for rendering
        await page.screenshot({
            path: path.join(__dirname, 'screenshots', '01-dashboard-lead.png'),
            fullPage: true
        });
        console.log('✅ Dashboard Lead salvata');

        // Screenshot 2: Dashboard Lead (zoomed to KPIs)
        console.log('📸 Catturando KPI Cards...');
        await page.goto(`file://${dashboardPath}`);
        await page.waitForTimeout(500);
        const kpiSection = await page.locator('.grid.grid-cols-1').first();
        await kpiSection.screenshot({
            path: path.join(__dirname, 'screenshots', '02-kpi-cards.png')
        });
        console.log('✅ KPI Cards salvate');

        // Screenshot 3: Lead Table
        console.log('📸 Catturando Tabella Lead...');
        const tableSection = await page.locator('table').first();
        await tableSection.screenshot({
            path: path.join(__dirname, 'screenshots', '03-lead-table.png')
        });
        console.log('✅ Tabella Lead salvata');

        console.log('\n✅ Tutti gli screenshot sono stati salvati in /screenshots/');

    } catch (error) {
        console.error('❌ Errore durante la cattura:', error);
    } finally {
        await browser.close();
    }
}

captureScreenshots();
