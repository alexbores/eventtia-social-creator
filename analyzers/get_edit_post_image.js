import path from 'path';
import fs from 'fs';


import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { generateImage } from '../modules/AI_fetcher.js';
import { getPromptEditImage} from '../modules/prompt_generator.js';
import { getImageName,formatImage} from '../modules/image_handlers.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getEditPostImage(postData) {

    let postImage = await getAiImage(postData);

    return {postImage};
}


async function getAiImage(data) {
    const { prompt, eventDate, eventName, post, imageUrl, screenshotUrl } = JSON.parse(data);
    

    let original = null;
    let reference = null;
    
    try{
      original = await formatImage(imageUrl, 'original');
      reference = await formatImage(screenshotUrl, 'screenshot');

      if (!reference || !reference.data || !reference.mimeType) {
        throw new Error("Missing valid Base64 image data (reference.data or reference.mimeType).");
      }
      if (!original || !original.data || !original.mimeType) {
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
    
    
    const systemPrompt = getPromptEditImage(); 

    const contextText = `
        **post edition prompt instructions:**
        ${prompt}
        **post context for reference if needed:**
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
          temperature: 0.1,
          imageConfig: {
            aspectRatio: "4:5"
          },
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
                {
                    inlineData: {
                        mimeType: original.mimeType, 
                        data: original.data,  
                    },
                },
            ],
        }],
    };

    console.log('AI image edition started for');

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



