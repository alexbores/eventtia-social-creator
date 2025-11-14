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

    const parsedData = (typeof data === 'string') ? JSON.parse(data) : data;
    const { eventDate, eventName, postText, imageUrl, postImageUrl } = parsedData;
    
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
      background = await formatImage(postImageUrl, 'background');
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

    const model = 'gemini-2.5-flash-image';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
    
    const requestBody = {
        generationConfig: {
            responseModalities: ["TEXT"],
            temperature: 1,
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
    
    console.log("AI analysis started 2");

    // --- 3. Execute the API Call ---
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        console.log("AI analysis started 3");

        if (!response.ok) {
            const errorBody = await response.json(); 
            console.error(`Gemini API Error (${response.status}):`, errorBody.error);
            throw new Error(`Gemini API responded with status: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        
        console.log("AI Response (Complete)");
        console.log(result);


        const generatedHTML = result[0]?.candidates?.[0]?.content?.parts?.find(part => part.text)?.text;

        
        return generatedHTML;

    } catch (error) {
        console.error('Error during AI HTML generation:', error);
        throw error;
    }
}


