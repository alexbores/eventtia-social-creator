import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Captures screenshots, HTML content, and console logs from a pre-loaded page.
 * @param {import('puppeteer').Page} page - The pre-loaded Puppeteer page instance.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - An object containing screenshots, HTML, and console logs.
 */
export async function getWebData(page, config) {
    const url = page.url();

    console.log('getting web data '+ config.screenSize);
    
    const viewport = config.screenSize.split('x').map(Number);
    const [width, height] = viewport;

    const report = {
        html: null,
        screenshot: null
    };

    try {
        console.log(`Capturing screenshot for viewport...`);
        await page.setViewport({ width: width, height: height });
    
        await new Promise(r => setTimeout(r, 500));

        // Changed back to fullPage screenshot as the timeout cause was the reload, not this.
        const baseScreenshotBuffer = await page.screenshot({ type: 'webp', quality: 50, fullPage: true });
        const baseFileName = `base_${config.screenSize}_${crypto.createHash('md5').update(url).digest('hex').substring(0, 8)}.webp`;
        fs.writeFileSync(path.join(config.imageDir, baseFileName), baseScreenshotBuffer);
        report.screenshot = config.imagePath + baseFileName;

    
        report.html = await page.content();

    } catch (error) {
        console.error(`Error during getWebData for ${url}:`, error);
        throw error;
    }

    
    return report;
}
