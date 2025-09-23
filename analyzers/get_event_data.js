const path = require('path');
const fs = require('fs');
// crypto is no longer needed in this file
const fetch = require('node-fetch');
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
    
    // 1. Use DOMParser to turn the HTML string into a real DOM document.
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // 2. Define the CSS selectors for all tags you want to extract text from.
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
    'title' // The page title
    '[type="application/ld+json"]'
  ];

  // 3. Find all matching elements and extract their text content.
  const elements = doc.querySelectorAll(selectors.join(', '));
  let combinedText = '';

  elements.forEach(el => {
    // el.textContent gets the text of an element and all its children.
    // .trim() removes extra whitespace from the start and end.
    const text = el.textContent.trim();
    if (text) {
      combinedText += text + '\n'; // Add a newline for readability
    }
  });

  // 4. Specifically find and add the content of any ld+json scripts.
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