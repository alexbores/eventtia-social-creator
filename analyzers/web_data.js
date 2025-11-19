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

        console.log(`Viewport correctly setted, stabilicing web...`);
        
        await page.evaluate(async () => {
          // Wait for 1 second of inactivity in scroll height to confirm page has finished loading content
          await new Promise(resolve => {
            let lastHeight = 0;
            const checkHeight = () => {
                const currentHeight = document.body.scrollHeight;
                if (currentHeight === lastHeight) {
                    // Height hasn't changed since the last check, page is stable
                    resolve();
                } else {
                    lastHeight = currentHeight;
                    setTimeout(checkHeight, 500); // Check again in 500ms
                }
            };
            checkHeight();
          });
        });


        const HARD_TIMEOUT = 20000; // 20 seconds maximum for the full attempt

        // Initialize the buffer variable outside the try block
        let baseScreenshotBuffer = null;
        let fallbackFileName = null;
    
        // --- 1. Attempt Robust Screenshot (with stabilization and timeout) ---
        try {
            console.log(`Viewport set. Attempting full-page screenshot with ${HARD_TIMEOUT / 1000}s timeout...`);

            baseScreenshotBuffer = await page.screenshot({ 
                type: 'webp', 
                quality: 50, 
                fullPage: false,
                timeout: HARD_TIMEOUT 
            });
            
        } catch (error) {
            console.warn(`⚠️ Screenshot failed after ${HARD_TIMEOUT / 1000}s (Timeout/Hang). Falling back to viewport screenshot.`);
            return null
        }

        if (baseScreenshotBuffer) {
          console.log(`saving screenshot...`);

          const baseFileName = fallbackFileName || `base_${config.screenSize}_${crypto.createHash('md5').update(url).digest('hex').substring(0, 8)}.webp`;
          fs.writeFileSync(path.join(config.imageDir, baseFileName), baseScreenshotBuffer);
          report.screenshot = config.imagePath + baseFileName;
        }
        
        console.log(`cleaning html page content...`);
        await page.evaluate(() => {
            // 1. Remove all <style> blocks (Inline CSS)
            // const styleTags = document.querySelectorAll('style');
            // styleTags.forEach(el => el.remove());
        
            // 2. Remove all <script> blocks (External/Inline JS code)
            const scriptTags = document.querySelectorAll('script');
            scriptTags.forEach(el => {
                const typeAttribute = el.getAttribute('type');

                // Check if the script tag is NOT JSON-LD
                // We want to keep: <script type="application/ld+json">
                if (typeAttribute && typeAttribute.includes('application/ld+json')) {
                    return;
                }
                if (el.src || !typeAttribute || typeAttribute.includes('javascript')) {
                    el.remove();
                }
            });
        
            // 3. Remove all <link> tags that load CSS files
            // const linkCssTags = document.querySelectorAll('link[rel="stylesheet"]');
            // linkCssTags.forEach(el => el.remove());
        
            const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
            hiddenElements.forEach(el => el.remove()); 
            
        });
        console.log(`getting page content...`);
    
        report.html = await page.content();

        console.log(`page content retrival succesfull...`);

    } catch (error) {
        console.error(`Error during getWebData for ${url}:`, error);
        throw error;
    }

    
    return report;
}
