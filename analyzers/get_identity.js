import path from 'path';
import fs from 'fs';


import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { getAIFetch } from '../modules/AI_fetcher.js';
import { stripHtml } from '../modules/html_stripper.js';
import { getPromptIdentity} from '../modules/prompt_generator.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getIdentity(data) {
    
    const { imageUrl, html} = JSON.parse(data);

    
    
    let content = await getContent(html);
    console.log('html for data identity extractor: '+html);

    let eventIdentity = await getAiAnalysisIdentity(html,imageUrl);

    console.log('identity :'+eventIdentity);



    let fonts = identity.fonts;
    let colors = identity.colors;


    return {
        fonts,
        colors
    };
}


async function getAiAnalysisIdentity(html,imageUrl) {

    let reference = null;
    
    try{
      reference = await formatImage(imageUrl, 'screenshot');

      if (!reference || !reference.data || !reference.mimeType) {
        throw new Error("Missing valid Base64 image data (reference.data or reference.mimeType).");
      }
    }
    catch(error){
      throw new Error("Error while formating images ",error);
    }


    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    

    let prompt = getPromptIdentity(html);


    const model = 'gemini-2.5-pro';

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // CHANGE 4: Optimized generationConfig
    const responseSchema = {
      type: "OBJECT",
      properties: {
        colors: {
          type: "OBJECT",
          properties: {
            primary_color: { type: "STRING", description: "Dominant hex color" },
            secondary_color: { type: "STRING", description: "Accent hex color" }
          },
          required: ["primary_color", "secondary_color"]
        },
        fonts: {
          type: "OBJECT",
          properties: {
            title_font: { type: "STRING", description: "Heading font family" },
            text_font: { type: "STRING", description: "Body font family" }
          },
          required: ["title_font", "text_font"]
        }
      },
      required: ["colors", "fonts"]
    };
    
    // Then, create the request body
    const requestBody = {
        contents: [
         {
             "parts": [
                 { "text": prompt }, // The text prompt
                 {
                     "inlineData": { // The first image
                         "mimeType": reference.mimeType,
                         "data": reference.data
                     }
                 },
             ]
         }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            
            responseJsonSchema: responseSchema,
            
            temperature: 0.8,
            thinkingConfig: {
              thinkingBudget: -1,
            },
        },
    };
    
    console.log("AI analysis started: Calling UNARY endpoint :generateContent");

    // --- 4. Execute the API Call ---
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        console.log("AI analysis fetch completed");

        // The 'response.json()' call will now work correctly.
        const result = await response.json();

        if (!response.ok) {
            // Log the detailed error message from the API
            const errorDetails = result.error? JSON.stringify(result.error) : 'No error details provided.';
            console.error(`Gemini API Error (${response.status}):`, errorDetails);
            throw new Error(`Gemini API responded with status: ${response.status} - ${result.error?.message || errorDetails}`);
        }

        console.log("AI Response (Complete Unary Object):");
        console.log(JSON.stringify(result, null, 2));

        const candidate = result.candidates?.[0];
        
        if (!candidate || candidate.finishReason!== 'STOP') {
            const feedback = result.promptFeedback? JSON.stringify(result.promptFeedback) : 'No prompt feedback.';
            const finishReason = candidate?.finishReason || 'No candidate generated.';
            console.warn(`AI generation finished unsuccessfully. Reason: ${finishReason}. Feedback: ${feedback}`);
            throw new Error(`AI generation failed. Reason: ${finishReason}.`);
        }

        const responseText = candidate.content?.parts?.find(part => part.text)?.text;

        if (!responseText) {
            console.error('AI response successful, but no text part was found in the candidate.');
            throw new Error('AI response did not contain a valid response string.');
        }
        
        // Parse the JSON string to get the actual HTML
        const parsedJson = JSON.parse(responseText);
        
        // Validate that we got what we asked for
        if (!parsedJson.colors || !parsedJson.fonts) {
             throw new Error('AI response missing colors or fonts properties.');
        }
        
        return parsedJson;

    } catch (error) {
        console.error('Error during AI generation:', error);
        throw error;
    }
}


async function getDesignContext(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // 1. Extract CSS (Critical for AI to identify colors/fonts)
  const styleTags = doc.querySelectorAll('style');
  let cssContext = '';
  
  styleTags.forEach(style => {
    // Minify slightly by removing excessive whitespace
    const cleanCss = style.textContent.replace(/\s+/g, ' ').trim();
    if (cleanCss) {
      cssContext += cleanCss + '\n';
    }
  });

  // 2. Extract Content Hierarchy (H tags and P tags)
  // We select them in a single query to preserve the visual order of the document.
  const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
  let htmlContext = '';

  elements.forEach(el => {
    // Only include elements that actually have text
    if (el.textContent.trim().length > 0) {
      // .outerHTML is crucial: it keeps <h1 class="title">Text</h1>
      // This allows the AI to match the class to the CSS extracted above.
      htmlContext += el.outerHTML + '\n';
    }
  });

  // 3. Construct the "Skeleton" HTML
  const finalOutput = `
<style>
${cssContext}
</style>
<div id="extracted-content">
${htmlContext}
</div>`;

  return finalOutput;
}







