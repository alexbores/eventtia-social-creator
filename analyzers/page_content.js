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
async function runPageContentAnalysis(webData, page, config, useAi = true) {
    const { screenshots, html } = webData;


    // --- Logic to find the largest screenshot ---
    let largestViewportName = '';
    let maxArea = 0;
    for (const viewportName in screenshots) {
        const [width, height] = viewportName.split('x').map(Number);
        const area = width * height;
        if (area > maxArea) {
            maxArea = area;
            largestViewportName = viewportName;
        }
    }

    console.log(largestViewportName);



    let items;
    if(useAi){
      items = await getAiAnalysis(webData,config,largestViewportName);
      items.forEach(item => {
        item.type = 'page_content';
        item.screenSize = largestViewportName;
      });
    }
    else{
      items = await getBasicAnalysis(page,largestViewportName);
    }
    

    return {
        items: items
    };
}


async function getAiAnalysis(webData,config,largestViewportName){
    const { screenshots, html } = webData;
    
    let screenshotBuffers = [];
    if (largestViewportName) {
        console.log(`Reading the largest screenshot (${largestViewportName}) for AI analysis...`);
        const publicPath = screenshots[largestViewportName];
        const fileName = path.basename(publicPath);
        const filePath = path.join(config.imageDir, fileName);
        
        try {
            const buffer = fs.readFileSync(filePath);
            screenshotBuffers.push({ buffer: buffer, name: `${largestViewportName}.jpeg` });
        } catch (error) {
            console.error(`Failed to read the largest screenshot file: ${filePath}`, error);
        }
    }

    if (screenshotBuffers.length === 0) {
        throw new Error('Could not read the largest screenshot file to send for analysis.');
    }
    


    // Prepare the prompt for the AI
    const focusList = `
        * **Event name is present and correct in an h1 tag**
        * **Event date and time is present and correct over the fold which is the first 700px**
        * **Event location is present and correct over the fold which is the first 700px**
        * **Event organizer's name is present**
        * **Event program / activity / agenda / speakers ,are present and correct with dates or times**
        * **Frequently Ask Questions or Practical information, are present**
        * **Copywriting is correct, is simple and then propose better version **
        * **Testimonials, Community **
        * **Call-to-Action (CTA) Wording and visibility, if is not above the fold recommend to do it** 
    `;
    const prompt = getPrompt(focusList);

    let srippedHtml = stripHtml(html);
    const fileNames = screenshotBuffers.map(shot => shot.name).join(', ');
    const promptWithFilenames = `The filenames for the screenshots are: ${fileNames}.\n\n` + prompt;
    const finalPrompt = promptWithFilenames + `\n\nHere is the page's HTML content:\n\`\`\`html\n${srippedHtml}\n\`\`\``;
    
    let cleanedJsonString = '';

    try {
        aiSummary = await getAIFetch('chatgpt', finalPrompt, screenshotBuffers);
        console.log("AI says:", aiSummary);

        cleanedJsonString = aiSummary.trim();
        const firstBracket = cleanedJsonString.indexOf('[');
        const lastBracket = cleanedJsonString.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket > firstBracket) {
            cleanedJsonString = cleanedJsonString.substring(firstBracket, lastBracket + 1);
        }
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error;
    }
    
    let items;
    try {
        items = JSON.parse(cleanedJsonString);
    } catch (parseError) {
        console.error('Failed to parse the cleaned JSON string:', parseError);
        items = [{
            id: "ai-summary-error-001",
            kind: "error",
            title: "AI Analysis Parsing Error",
            summary: `The AI response could not be parsed as JSON. Raw AI text: ${aiSummary}`,
            highlights: [], 
            screenSize: largestViewportName,
        }];
    }

    return items;
}


async function getBasicAnalysis(page,largestViewportName){
    
    if (!largestViewportName) {
      return;
    }

    const [widthStr, heightStr] = largestViewportName.split('x');

    const viewport = {
        width: Number(widthStr), 
        height: Number(heightStr),
        name: largestViewportName,
    };

    console.log(viewport);


    const items = [];
    let issues = null;

    try {
        console.log(`Analyzing all basics`);
        await page.setViewport({ width: viewport.width, height: viewport.height });
        await new Promise(r => setTimeout(r, 200));

       

        issues = await page.evaluate((largestViewportName) => {
          const analyzeImageTextRatio = (largestViewportName) => {
              const mainContentElements = Array.from(document.body.children).filter(el => {
                  const tagName = el.tagName.toLowerCase();
                  return tagName !== 'header' && tagName !== 'footer' && tagName !== 'script' && tagName !== 'style';
              });
          
              if (mainContentElements.length === 0) {
                  return [];
              }
          
              // Calculate the total area of the main content blocks
              let totalContentArea = 0;
              mainContentElements.forEach(el => {
                  const rect = el.getBoundingClientRect();
                  totalContentArea += rect.width * rect.height;
              });
          
              // Calculate the total area of media within the main content
              let mediaArea = 0;
              const mediaElements = document.querySelectorAll('main img, main video, body > *:not(header):not(footer) img, body > *:not(header):not(footer) video');
              mediaElements.forEach(el => {
                  const rect = el.getBoundingClientRect();
                  mediaArea += rect.width * rect.height;
              });
          
              // Avoid division by zero if there's no content area
              if (totalContentArea === 0) {
                  return [];
              }
          
              const mediaRatio = mediaArea / totalContentArea;
              const MEDIA_THRESHOLD = 0.40; // 40%
          
              // If the media ratio is below the threshold, return a warning.
              if (mediaRatio < MEDIA_THRESHOLD) {
                  return [{ // Return as an array
                      id: `content-low-media-ratio`,
                      kind: 'recommendation',
                      title: 'Low Image-to-Text Ratio',
                      summary: `The page has a low ratio of visual media (images/videos) to text, currently at ${Math.round(mediaRatio * 100)}%. A ratio of at least 40% is recommended to keep users engaged.`,
                      highlights: [],
                      screenSize: largestViewportName,
                      type: 'page_content',
                  }];
              }
          
              return []; // If the ratio is good, return an empty array
          };
          
          


          // --- MAIN EXECUTION (inside the browser) ---
          const imageIssues = analyzeImageTextRatio(largestViewportName);

          // Combine the results from all checks into a single array
          return [...imageIssues];

        },largestViewportName);

        items.push(...issues);

    } catch(error){
       console.error(`Error during analyzing all basics: `, error);
       throw error;
    }
   

    return items;
}


module.exports = { runPageContentAnalysis };