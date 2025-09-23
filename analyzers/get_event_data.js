const path = require('path');
const fs = require('fs');


const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const { getAIFetch } = require('../modules/AI_fetcher');
const { stripHtml } = require('../modules/html_stripper');
const { getPromptDate } = require('../modules/prompt_generator');

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
async function getEventData(html) {

    let date = await getAiAnalysis(html);

    let content = await getContent(html);

    return {date, content};
}



async function getAiAnalysis(html) {

    const prompt = getPromptDate();
    
    let srippedHtml = stripHtml(html);
    let finalPrompt = `${prompt} \n\nHere is the page's HTML content:\n\`\`\`html\n${srippedHtml}\n\`\`\``;
    
    let aiSummary = '';
    let cleanedString = '';


    console.log('AI analyis started');

    try {
        aiSummary = await getAIFetch('chatgpt', finalPrompt, []);
        console.log("AI says:", aiSummary);

        cleanedString = aiSummary.trim();
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error.message;
    }

    return cleanedString;
}


async function getContent(html){
    
  // 2. Create a JSDOM instance from the HTML string.
  // The 'dom.window.document' object is your equivalent to the browser's 'document'.
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;

  // 3. The rest of your code works exactly the same!
  const selectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Headings
    'p', // Paragraphs
    'li', // List items
    'a', // Links
    'button', // Buttons
    'span', // Spans
    'label', // Form labels
    'td', 'th', // Table cells
    'strong', 'b', // Bold text
    'em', 'i', // Italicized text
    'blockquote', // Blockquotes
    'title', // The page title
    '[type="application/ld+json"]'
  ];


  const elements = doc.querySelectorAll(selectors.join(', '));
  let combinedText = '';

  elements.forEach(el => {
    const text = el.textContent.trim();
    if (text) {
      combinedText += text + '\n';
    }
  });

  const ldJsonScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  ldJsonScripts.forEach(script => {
    const jsonContent = script.textContent.trim();
    if (jsonContent) {
      combinedText += jsonContent + '\n';
    }
  });

  return combinedText;

}



module.exports = { getEventData };