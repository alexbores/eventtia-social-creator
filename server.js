const express = require('express');
const session = require('express-session');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

// Import the analyzer modules
const { getWebData } = require('./analyzers/web_data');
const { getPosts } = require('./analyzers/get_posts');

const app = express();
const PORT = process.env.PORT || 3000;

const PAGE_EXPIRATION_MS = 10 * 60 * 1000; 

// --- CONFIGURATION ---
const config = {
    imagePath: '/images/analysis/',
    imageDir: path.join(__dirname, 'public/images/analysis/')
};

// Create the directory for saving images if it doesn't exist
if (!fs.existsSync(config.imageDir)) {
    fs.mkdirSync(config.imageDir, { recursive: true });
}

app.set('trust proxy', 1); 

app.use(cors({
    origin: 'https://eventtia-social-creator.onrender.com/', 
    credentials: true
}));

// --- MIDDLEWARE ---
app.use(express.json({ limit: '500mb' }));
app.use(express.static(path.join(__dirname, 'public')));


// Setup session middleware. to track users.
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-default-secret-key-for-development',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true, // Must be true for HTTPS and SameSite=None
        httpOnly: true, // Helps prevent XSS attacks
        sameSite: 'none' // Required for cross-domain cookies
    }
}));

// --- BROWSER MANAGEMENT ---
let browser; // A single, shared browser instance
const userPages = new Map(); // In-memory store for user pages

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

function closeAndRemovePage(sessionId) {
    if (userPages.has(sessionId)) {
        const { page, timeoutId } = userPages.get(sessionId);
        clearTimeout(timeoutId);
        page.close().catch(err => console.error(`Error closing page for session ${sessionId}:`, err));
        userPages.delete(sessionId);
        console.log(`Cleaned up expired page for session: ${sessionId}`);
    }
}

async function getOrCreatePageForUser(sessionId) {
    // If the user already has a page, reuse it and reset its expiration timer
    if (userPages.has(sessionId)) {
        console.log(`Reusing page for session: ${sessionId}`);
        const pageData = userPages.get(sessionId);
        clearTimeout(pageData.timeoutId); // Reset the timer
        pageData.timeoutId = setTimeout(() => closeAndRemovePage(sessionId), PAGE_EXPIRATION_MS);
        return pageData.page;
    }

    // If it's a new user, create a new page and set its expiration timer
    console.log(`Creating new page for session: ${sessionId}`);
    const page = await browser.newPage();
    const timeoutId = setTimeout(() => closeAndRemovePage(sessionId), PAGE_EXPIRATION_MS);
    userPages.set(sessionId, { page, timeoutId });
    return page;
}

// --- API ROUTE ---
app.post('/api/analyze', async (req, res) => {
    const { url, rquest } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const sessionId = req.session.id;
        const page = await getOrCreatePageForUser(sessionId);
        
        // Navigate and scroll only if the user provides a new URL
        if (page.url() !== url) {
            console.log(`Navigating session ${sessionId}'s page to new URL: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 900000 });
            await autoScroll(page);
            
            // If we navigate, clear any old data from the session
            if (req.session.webData) {
                delete req.session.webData;
            }
        }


        let resultsWebData = await getWebData(page, config);
        let resultsPosts = await getPosts(resultsWebData);

        res.status(200).json(
          {
            webData: resultsWebData,
            posts: resultsPosts,
          }
        );
        
    } catch (error) {
        console.error(`Error during analysis for request :`, error);
        res.status(500).json({ error: `Failed to analyze the page. Error: ${error.message}` });
    }
});

// --- SERVER STARTUP AND SHUTDOWN ---
const startServer = async () => {
    console.log('Launching a single browser instance...');
    browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });
    console.log('Browser launched successfully.');
    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
};

// Graceful shutdown for the main browser instance
const cleanup = async () => {
    if (browser) {
        console.log("\nClosing browser instance...");
        await browser.close();
        console.log("Browser closed.");
    }
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

startServer().catch(error => {
    console.error("Failed to start the server:", error);
    process.exit(1);
});