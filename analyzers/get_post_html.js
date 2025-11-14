import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { getAIFetch } from '../modules/AI_fetcher.js';
import { stripHtml } from '../modules/html_stripper.js';
import { getPromptPostHTML } from '../modules/prompt_generator.js';
import { getImageName,formatImage} from '../modules/image_handlers.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getPostHTML(data) {
    
    let html = await getAiAnalysis(data);


    return {html};
}

async function getAiAnalysis(data) {

    const { eventDate, eventName, postText, imageUrl, postImageUrl  } = JSON.parse(data);
    
    // --- All your image formatting code is correct ---
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

    let background = null;
    try{
      background = await formatImage(postImageUrl, 'screenshot');
      if (!background || !background.data || !background.mimeType) {
        throw new Error("Missing valid Base64 image data (background.data or background.mimeType).");
      }
    }
    catch(error){
      throw new Error("Error while formating images ",error);
    }

    let postPromptData = {
        eventDate,
        eventName,
        postText,
        postImageUrl
    }
    const prompt = getPostHTML(postPromptData);
    
    console.log('AI analysis started');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    // --- 2. Construct the Gemini API Payload ---
    // ⭐️ We use YOUR original model
    const model = 'gemini-2.5-flash-image';
    
    // ⭐️⭐️⭐️ THE FIX ⭐️⭐️⭐️
    // We use the NON-streaming endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
        generationConfig: {
            temperature: 1,
            // We don't need responseModalities here, as text is the default
            // for generateContent.
        },
        contents: [{
            parts: [
                {
                    text: prompt
                },
                {
                    inlineData: {
                        mimeType: reference.mimeType,
                        data: reference.data,
                    },
                },
                {
                    inlineData: {
                        mimeType: background.mimeType,
                        data: background.data,
                    },
                },
            ],
        }],
    };

    // --- 3. Execute the API Call ---
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.json(); 
            console.error(`Gemini API Error (${response.status}):`, errorBody.error);
            throw new Error(`Gemini API responded with status: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
        }

        // ⭐️ This will now work perfectly, as the response is a single JSON object
        const result = await response.json();
        
        console.log("AI Response (Complete)");

        const generatedHTML = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedHTML) {
            console.error("Failed to extract HTML from AI response:", result);
            throw new Error("AI generated an empty or invalid response.");
        }
        
        return generatedHTML;

    } catch (error) {
        console.error('Error during AI HTML generation:', error);
        throw error;
    }
}


