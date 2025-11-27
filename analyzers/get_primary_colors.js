import path from 'path';
import fs from 'fs';


import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { getAIFetch } from '../modules/AI_fetcher.js';
import { getPromptPrimaryColors} from '../modules/prompt_generator.js';
import { getImageName,formatImage} from '../modules/image_handlers.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getPrimaryColors(data) {
    
    const { imageUrl } = JSON.parse(data);


    let eventIdentity = await getAiAnalysisIdentity(imageUrl);

    console.log('identity :'+eventIdentity);




    return eventIdentity;
}


async function getAiAnalysisIdentity(imageUrl) {

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
    

    let prompt = getPromptPrimaryColors();


    const model = 'gemini-3-pro-image-preview';

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const responseSchema = {
        type: "OBJECT",
        properties: {
            colors: {
                type: "ARRAY",
                description: "A list of dominant colors, including their hexadecimal code and proportional percentage of image dominance.",
                items: {
                    type: "OBJECT",
                    properties: {
                        hex: {
                            type: "STRING",
                            description: "The Hex code for the detected color (e.g., #FF5733)."
                        },
                        percentage: {
                            type: "NUMBER", // Use NUMBER for floating point values
                            description: "The percentage of dominance for this color (e.g., 55.45)."
                        }
                    },
                    required: ["hex", "percentage"]
                }
            }
        },
        required: ["colors"]
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
    
    console.log("AI analysis colors generator started: Calling UNARY endpoint :generateContent");

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
        
        
        return parsedJson;

    } catch (error) {
        console.error('Error during AI generation:', error);
        throw error;
    }
}









