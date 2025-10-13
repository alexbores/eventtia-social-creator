import express from 'express';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import 'dotenv/config';

// Import the analyzer modules
import { getWebData } from './analyzers/web_data.js';
import { getEventData } from './analyzers/get_event_data.js';
import { getPosts } from './analyzers/get_posts.js';
import { getPostsRemade } from './analyzers/get_posts_remade.js';
import { getPostImage } from './analyzers/get_post_image.js';
import { saveImage } from './analyzers/save_image.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
const config = {
    screenSize: "1440x900",
    imagePath: '/images/analysis/',
    imageDir: path.join(__dirname, 'public/images/analysis/')
};

if (!fs.existsSync(config.imageDir)) {
    fs.mkdirSync(config.imageDir, { recursive: true });
}

app.set('trust proxy', 1);

app.use(cors({
    origin: 'https://eventtia-social-creator.onrender.com/'
}));

// --- MIDDLEWARE ---
app.use(express.json({ limit: '500mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- UTILITY FUNCTION ---
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const scrollHeight = document.body.scrollHeight;
            if (scrollHeight === 0) {
                resolve();
                return;
            }
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    window.scrollBy(0, 0);
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// --- API ROUTE ---
app.post('/api/analyze', async (req, res) => {
    const { url, request, webData } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    let browser = null;

    let response = null;
    try {
        switch(request){
          case 'web_data':
            // --- Step 1: Puppeteer block ---
            console.log(`Launching browser to get web data from: ${url}`);
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
            console.log('Browser launched successfully.');

            const page = await browser.newPage();

            // Enable request interception
            await page.setRequestInterception(true);
            
            // Listen for each request and decide whether to continue or abort it
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                // if (['stylesheet', 'font'].includes(resourceType)) {
                //     req.abort();
                // } else {
                    req.continue();
                // }
            });

            console.log(`going to the url`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 1000000 });
            await autoScroll(page);

            console.log('Gettign the web data.');
            response = await getWebData(page, config);

            // Close browser and release memory
            await browser.close();
            console.log('Browser closed. Memory released.');
            browser = null; 
          break;
          case 'event_data':
            console.log('Starting analysis of event data...');
            response = await getEventData(webData);
          break;
          case 'posts':
            console.log('Starting analysis of web data...');
            response = await getPosts(webData);
          break;
          case 'posts_remake':
            console.log('Starting analysis of web data remake...');
            response = await getPostsRemade(webData);
          break;
          case 'post_image':
            console.log('Starting analysis of post image...');
            response = await getPostImage(webData);
          break;
          case 'save_image':
            console.log('Saving Image...');
            response = await saveImage(webData);
          break;
        
        }

        // --- Step 4: Send the final response ---
        res.status(200).json(response);

    } catch (error) {
        console.error(`Error during analysis for ${url}:`, error);
        res.status(500).json({ error: `Failed to analyze the page. Error: ${error.message}` });
    } finally {
        // Safety net: ensures browser is closed if an error occurs before the explicit close call
        if (browser) {
            await browser.close();
            console.log('Browser closed due to an error. All resources released.');
        }
    }
});

// --- SERVER STARTUP ---
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));