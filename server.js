const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

// Import the analyzer modules
const { getWebData } = require('./analyzers/web_data');
const { getEventData } = require('./analyzers/get_event_data');
const { getPosts } = require('./analyzers/get_posts');
const { getPostsRemade } = require('./analyzers/get_posts_remade');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
const config = {
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

            const page = await browser.newPage();

            // 1. Enable request interception
            await page.setRequestInterception(true);
            
            // 2. Listen for each request and decide whether to continue or abort it
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (['stylesheet', 'font'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });


            console.log(`going to the url`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 900000 });
            await autoScroll(page);
            

            console.log('Gettign the web data.');
            response = await getWebData(page, config);

            // --- Step 2: Close browser and release memory ---
            await browser.close();
            console.log('Browser closed. Memory released.');
            browser = null; // Set to null to prevent re-closing in finally block
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