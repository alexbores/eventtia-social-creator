import path from 'path';
import fs from 'fs';


import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { getAIFetch } from '../modules/AI_fetcher.js';
import { stripHtml } from '../modules/html_stripper.js';
import { getPromptDate, getPromptContent, getPromptName } from '../modules/prompt_generator.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getEventData(html) {

    console.log('html for data: '+html);
    


    let currentDate = getCurrentDate();



    let eventDate = await getAiAnalysisDate(html);
    console.log('event date :'+eventDate);



    eventDate = advanceDateIfOlder(eventDate, currentDate);
    console.log('event date modified:'+eventDate);



    let eventName = await getAiAnalysisEventName(html);
    console.log('event Name:'+eventName);



    let content = await getContent(html);
    content = await getAiAnalysisContent(content);
    console.log('event cleaned content :'+content);



    // let speaker = await getSpeakersData();


    let logoUrl = await getLogoSrc(html);


    return {
        currentDate, 
        eventDate, 
        eventName,
        content,
        logoUrl,
    };
}


async function getAiAnalysisEventName(html) {

    const prompt = getPromptName();
    
    let srippedHtml = stripHtml(html);
    let finalPrompt = `${prompt} 
                       \n\nHere is the page's HTML content:\n\`\`\`html\n${srippedHtml}\n\`\`\``;
    
    let aiSummary = '';
    let cleanedString = '';


    console.log('AI analyis started');

    try {
        aiSummary = await getAIFetch('chatgpt', finalPrompt, []);
        console.log("AI says:", aiSummary);

        cleanedString = aiSummary.trim().slice(1, -1).replace(/^"|"$/g, '');
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error.message;
    }

    return cleanedString;
}

async function getAiAnalysisDate(html) {

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

async function getAiAnalysisContent(data) {

    const prompt = getPromptContent();
    
    let finalPrompt = `${prompt} 
                       \n\nHere is the content:\n\`\`\`\n${data}\n\`\`\``;
    
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


async function getContent(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // 1. Define selectors for standard, human-readable text tags.
  const textSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'li', 'a', 'button', 'span', 'label',
    'td', 'th', 'strong', 'b', 'em', 'i',
    'blockquote', 'title', 'div', 'script[type="application/ld+json"]'
  ];

  let combinedText = '';

  textSelectors.forEach(selector=>{
     let textElements = doc.querySelectorAll(selector);
     textElements.forEach(el => {
       let text = el.textContent.trim();
       if (text) {
         combinedText += text + '\n';
       }
     });
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


function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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
  return formatDate(dateToCheck);
}




async function getLogoSrc(html, baseUrl = '') {
  const dom = new JSDOM(html, { url: baseUrl || "http://localhost" });
  const doc = dom.window.document;

  // --- STRATEGY 1: Check JSON-LD (Structured Data) ---
  // This is the most accurate method if the site uses SEO best practices.
  const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLd) {
    try {
      const data = JSON.parse(script.textContent);
      // Handle both single objects and arrays of objects
      const items = Array.isArray(data) ? data : [data];
      
      for (const item of items) {
        if (item['@type'] === 'Organization' || item['@type'] === 'Brand') {
          if (item.logo) {
            const logoUrl = typeof item.logo === 'string' ? item.logo : item.logo.url;
            if (logoUrl) return resolveUrl(logoUrl, baseUrl);
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // --- STRATEGY 2: Heuristic Scoring (DOM Analysis) ---
  const images = Array.from(doc.querySelectorAll('img'));
  let bestCandidate = { el: null, score: 0, src: '' };

  images.forEach((img) => {
    let score = 0;
    const src = img.getAttribute('src') || img.getAttribute('data-src'); // specific for lazy loading
    const alt = (img.getAttribute('alt') || '').toLowerCase();
    const className = (img.getAttribute('class') || '').toLowerCase();
    const id = (img.getAttribute('id') || '').toLowerCase();
    
    if (!src) return; // Skip images without sources

    const srcLower = src.toLowerCase();

    // 1. Keyword Matching (High Value)
    if (srcLower.includes('logo')) score += 10;
    if (alt.includes('logo')) score += 5;
    if (className.includes('logo') || id.includes('logo')) score += 5;
    
    // 2. Structural Location (High Value)
    // Check if inside <header> or <nav>
    const closestHeader = img.closest('header, nav, .navbar, .nav, .header');
    if (closestHeader) {
      score += 5;
    }

    // 3. Functional Location
    // Check if wrapped in an <a> tag that points to the root "/"
    const parentLink = img.closest('a');
    if (parentLink) {
      const href = parentLink.getAttribute('href');
      if (href === '/' || href === baseUrl || (baseUrl && href === baseUrl + '/')) {
        score += 5;
      }
    }

    // 4. Negative Heuristics (Filter out noise)
    // If it's an SVG in src, it's likely an icon or logo (good)
    if (srcLower.endsWith('.svg')) score += 2;
    // If it looks like a social icon (twitter, fb), penalize it
    if (srcLower.includes('facebook') || srcLower.includes('twitter') || srcLower.includes('instagram')) score -= 10;

    // Update best candidate if this one beats the previous high score
    if (score > bestCandidate.score) {
      bestCandidate = { el: img, score: score, src: src };
    }
  });

  if (bestCandidate.src) {
    return resolveUrl(bestCandidate.src, baseUrl);
  }

  // --- STRATEGY 3: Fallback to Open Graph Image ---
  // Often the "og:image" is a branded image or the logo
  const ogImage = doc.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.content) {
    return resolveUrl(ogImage.content, baseUrl);
  }

  return null; // No logo found
}

function resolveUrl(src, baseUrl) {
  if (!baseUrl) return src;
  try {
    return new URL(src, baseUrl).href;
  } catch (e) {
    return src;
  }
}



