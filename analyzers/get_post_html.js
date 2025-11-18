import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
// Assuming these imports are correct and functional
import { getAIFetch } from '../modules/AI_fetcher.js';
import { stripHtml } from '../modules/html_stripper.js';
import { getPromptPostHTML } from '../modules/prompt_generator.js';
import { formatImage } from '../modules/image_handlers.js';

// No changes to the outer function
export async function getPostHTML(data) {
    let html = await getAiAnalysis(data);


    html = correctHTML(html);
    

    return { html };
}

/**
 * Corrected function to generate HTML by calling the Gemini API's 
 * NON-STREAMING (unary) endpoint.
 */
async function getAiAnalysis(data) {
    const { eventDate, eventName, postText, imageUrl, postImageUrl, logoUrl } = JSON.parse(data);
    
    // --- 1. Image Formatting (Unchanged, assumed correct) ---
    let reference = null;
    try {
      reference = await formatImage(imageUrl, 'screenshot');
      if (!reference ||!reference.data ||!reference.mimeType) {
        throw new Error("Missing valid Base64 image data (reference.data or reference.mimeType).");
      }
    } catch(error) {
      console.error("Error while formatting reference image:", error);
      throw new Error("Error while formatting images: " + error.message);
    }

    let background = null;
    try {
      background = await formatImage(postImageUrl, 'background');
      if (!background || !background.data || !background.mimeType) {
        throw new Error("Missing valid Base64 image data (background.data or background.mimeType).");
      }
    } catch(error) {
      console.error("Error while formatting background image:", error);
      throw new Error("Error while formatting images: " + error.message);
    }

    // --- 2. Prompt Generation (Unchanged, assumed correct) ---
    // NOTE: There is a recursive call in the original code.
    // The original code has: const prompt = getPostHTML(postPromptData);
    // This is likely a bug and should be:
    // const prompt = getPromptPostHTML(postPromptData);
    // This solution assumes the user intended to call the prompt generator.
    let postPromptData = {
        eventDate,
        eventName,
        postText,
        postImageUrl,
        logoUrl,
    };
    const prompt = getPromptPostHTML(postPromptData); // Corrected function call
    
    console.log('AI analysis started');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    // --- 3. CRITICAL CHANGES: API Configuration ---

    // CHANGE 2: Model Selection
    // 'gemini-2.5-flash-image' is for IMAGE GENERATION (outputting images).
    // 'gemini-2.5-pro' or 'gemini-2.5-flash' are for multimodal INPUT
    // (text + images) and text OUTPUT. 'gemini-2.5-pro' is used here
    // to match the original Bash script's intent.
    const model = 'gemini-2.5-pro';

    // CHANGE 1: API Endpoint
    // Switched from ':streamGenerateContent' to ':generateContent'.
    // This requests a single, non-streaming, JSON response.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // CHANGE 4: Optimized generationConfig
    const responseSchema = {
      "type": "object",
      "properties": {
        "html": {
          "type": "string",
          "description": "The complete, valid, self-contained HTML 5 code for the micro website, including all <html>, <head>, <style>, and <body> tags."
        }
      },
      "required": ["html"]
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
                 {
                     "inlineData": { // The second image
                         "mimeType": background.mimeType,
                         "data": background.data
                     }
                 }
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

        // --- 5. CRITICAL CHANGES: Response Parsing ---

        // CHANGE 3: Response Parsing
        // The 'result' is now a single object, NOT an array.
        // The path is: result -> candidates -> content -> parts -> text
        const candidate = result.candidates?.[0];
        
        // CHANGE 5: Robust Error Handling & Validation
        // Check for 'finishReason' (e.g., "SAFETY") or missing content
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
        const generatedHTML = parsedJson.html;
        
        if (!generatedHTML) {
             console.error('AI response did not contain an "html" property in its JSON output.');
             throw new Error('AI response JSON did not contain a valid HTML string.');
        }
        
        // This 'generatedHTML' is the single, complete string.
        return generatedHTML;

    } catch (error) {
        console.error('Error during AI HTML generation:', error);
        throw error;
    }
}



function correctHTML(html){
   html += `<style>
       body,
       html{
         padding: 0!important;
       }
   </style>`;

   return html;
}