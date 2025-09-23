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
    
    let currentDate = getCurrentDate();

    let eventDate = await getAiAnalysis(html);

    console.log('event date :'+eventDate);


    eventDate = advanceDateIfOlder(eventDate, currentDate);

    console.log('event date modified:'+eventDate);


    let content = await getContent(html);

    return {currentDate, eventDate, content};
}



async function getAiAnalysis(html) {

    const prompt = getPromptDate();
    
    let srippedHtml = stripHtml(html);
    let finalPrompt = `${prompt} 
                       \n\nHere is the page's HTML content:\n\`\`\`html\n${srippedHtml}\n\`\`\``;
    
    let aiSummary = '';
    let cleanedString = '';


    console.log('AI analyis started');

    try {
        aiSummary = await getAIFetch('chatgpt', finalPrompt, []);
        console.log("AI says:", aiSummary);

        cleanedString = aiSummary.trim().slice(1, -1);
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error.message;
    }

    return cleanedString;
}


async function getContent(html){
    
  const dom = new JSDOM(html);
  const doc = dom.window.document;

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


  console.log(combinedText);

  return combinedText;

}

function getCurrentDate(){
    const today = new Date();

    // Get the year, month, and day
    const year = today.getFullYear();
    
    // Get the month (which is zero-indexed, so we add 1) and pad with a zero if needed
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get the day and pad with a zero if needed
    const day = String(today.getDate()).padStart(2, '0');
    
    // Combine the parts into the desired format
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}



function advanceDateIfOlder(dateToCheckStr, referenceDateStr) {
  const dateToCheck = new Date(dateToCheckStr);
  const referenceDate = new Date(referenceDateStr);

  console.log(`Initial date to check: ${dateToCheck.toDateString()}`);
  console.log(`Reference date:        ${referenceDate.toDateString()}`);

  // Use a while loop to keep adding a year as long as the date is older
  while (dateToCheck < referenceDate) {
    console.log('Date is older, adding one year...');
    // Get the current year and add 1
    const newYear = dateToCheck.getFullYear() + 1;
    // Set the date's year to the new year
    dateToCheck.setFullYear(newYear);
    console.log(`Date is now: ${dateToCheck.toDateString()}`);
  }

  console.log(`Final updated date: ${dateToCheck.toDateString()}`);
  return dateToCheck;
}


module.exports = { getEventData };