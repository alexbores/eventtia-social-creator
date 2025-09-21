const path = require('path');
const fs = require('fs');
// crypto is no longer needed in this file
const fetch = require('node-fetch');
const { getAIFetch } = require('../modules/AI_fetcher');
const { stripHtml } = require('../modules/html_stripper');
const { getPrompt } = require('../modules/prompt_generator');

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
async function getPosts(webData) {
    const { html } = webData;

    let items;
    items = await getAiAnalysis(webData);
    items.map(item => {
      item.status = 'schedule'
    });

    return {
        posts: items
    };
}



async function getAiAnalysis(webData) {
    const { html } = webData;

    const prompt = getPrompt();
    
    let srippedHtml = stripHtml(html);
    let finalPrompt = `\n\nHere is the page's HTML content:\n\`\`\`html\n${srippedHtml}\n\`\`\``;
    
    let aiSummary = '';
    let cleanedJsonString = '';


    console.log('AI analyis started');

    try {
        aiSummary = await getAIFetch('chatgpt', finalPrompt, []);
        console.log("AI says:", aiSummary);

        cleanedJsonString = aiSummary.trim();
        const firstBracket = cleanedJsonString.indexOf('[');
        const lastBracket = cleanedJsonString.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket > firstBracket) {
            cleanedJsonString = cleanedJsonString.substring(firstBracket, lastBracket + 1);
        }
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error.message;
    }

    let items;
    try {
        items = JSON.parse(cleanedJsonString);
    } catch (parseError) {
        console.error('Failed to parse the cleaned JSON string:', parseError);
        items = [{
            id: "error",
        }];
    }

    return items;
}



module.exports = { getPosts };