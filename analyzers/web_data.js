const path = require('path');
const fs = require('fs');
const crypto =require('crypto');

/**
 * Captures screenshots, HTML content, and console logs from a pre-loaded page.
 * @param {import('puppeteer').Page} page - The pre-loaded Puppeteer page instance.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - An object containing screenshots, HTML, and console logs.
 */
async function getWebData(page) {
    const url = page.url();

    const report = {
        html: null
    };

    const consoleLogs = [];

    try {
        report.html = await page.content();

    } catch (error) {
        console.error(`Error during getWebData for ${url}:`, error);
        throw error;
    }
    
    return {
        html: report.html
    };
}

module.exports = { getWebData };