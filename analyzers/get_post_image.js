import path from 'path';
import fs from 'fs';


import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { generateImage } from '../modules/AI_fetcher.js';
import { getPromptImage} from '../modules/prompt_generator.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getPostImage(postData) {

    let postImage = await getAiImage(postData);

    return {postImage};
}


async function getAiImage(data) {
    const { eventDate, eventName, post, imageUrl } = JSON.parse(data);
    
    let reference = null;

    try {
        // 1. Fetch the image data from the URL (Bypasses CORS)
        const response = await fetch(imageUrl);
    
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: Status ${response.status}`);
        }
    
        // 2. Extract necessary metadata
        const mimeType = response.headers.get('content-type') || 'application/octet-stream';
        const extension = mimeType.split('/')[1] || 'bin'; // Fallback to 'bin'
    
        // 3. Convert image stream to ArrayBuffer, then Buffer, then Base64
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const base64Data = imageBuffer.toString('base64');
    
        // 4. Construct the final 'reference' object (required for the Gemini API and WP API)
        reference = {
            data: base64Data,
            mimeType: mimeType,
            name: getImageName(imageUrl) + '.' + extension 
        };
    
        console.log("Successfully processed image from URL.");
        // console.log("Reference Object:", reference); 
    
    } catch (error) {
        console.error("Image processing error:", error.message);
        
        // We re-assign reference to null/undefined to ensure the validation check below handles it
        reference = null;
    }

    console.log(reference);
    
    if (!reference || !reference.data || !reference.mimeType) {
        throw new Error("Missing valid Base64 image data (reference.data or reference.mimeType).");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    
    
    const systemPrompt = getPromptImage(); 

    const contextText = `
        **post context:**
        * ** Event date: ${eventDate},
        * ** Event Name: ${eventName},
        * ** Post Type: ${post.type},
        * ** Post Date: ${post.date},
        * ** Post Content: ${post.title}, ${post.content}
    `;

    let fullPrompt = systemPrompt + ' ' + contextText;

    // --- 2. Construct the Gemini API Payload ---
    const model = 'gemini-2.5-flash-image';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

    const requestBody = {
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
        contents: [{
            parts: [
                {
                    text: fullPrompt
                },
                {
                    inlineData: {
                        mimeType: reference.mimeType,
                        data: reference.data,
                    },
                },
            ],
        }],
    };

    console.log('AI image generation started for:', eventName);

    console.log(requestBody);

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
        // Look for the part containing the inlineData (the generated image)
        console.log("AI Response");
        console.log(result);
        // console.log(result[0]?.candidates);
        // console.log(result[0]?.candidates?.[0]?.content?.parts);

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



function getImageName(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return '';
    }

    const parts = imageUrl.split('/');
    let fileNameWithExtensionAndQuery = parts.pop() || '';

    if (fileNameWithExtensionAndQuery === '') {
        fileNameWithExtensionAndQuery = parts.pop() || '';
    }

    const fileWithExtension = fileNameWithExtensionAndQuery.split('?')[0];

    const lastDotIndex = fileWithExtension.lastIndexOf('.');

    if (lastDotIndex !== -1) {
        return fileWithExtension.substring(0, lastDotIndex);
    }
    
    return fileWithExtension;
}