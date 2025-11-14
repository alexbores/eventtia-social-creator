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


    return html;
}

async function getAiAnalysis(data) {

    const { eventDate, eventName, postText, imageUrl, postImageUrl  } = JSON.parse(data);
    

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


    const prompt = getPromptPostHTML(postPromptData);
    

    let aiSummary = '';
    let cleanedJsonString = '';



    console.log('AI analyis started');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    // --- 2. Construct the Gemini API Payload ---
    const model = 'gemini-2.5-flash-image';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

    const requestBody = {
        generationConfig: {
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

        const result = await response.json();
        
        // --- 4. Parse the Generated Image Output ---
        console.log("AI Response");
        console.log(result);

        const generatedImagePart = result[0]?.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (generatedImagePart && generatedImagePart.inlineData) {
            console.log("✅ AI image generated successfully.");
            
            // Return the necessary data for the client/server to save or display
            return {
                data: generatedImagePart.inlineData.data,
                mimeType: generatedImagePart.inlineData.mimeType
            };
        } else {
            const textOutput = result[0]?.candidates?.[0]?.content?.parts?.find(part => part.text)?.text;
            console.warn("API was successful but returned no image. Model Text:", textOutput);
            return null; // Explicitly return null if no image is generated
        }

    } catch (error) {
        console.error('Error during AI image generation:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}


