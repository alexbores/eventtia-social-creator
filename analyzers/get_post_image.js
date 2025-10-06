const path = require('path');
const fs = require('fs');


const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const { generateImage } = require('../modules/AI_fetcher');
const { getPromptImage} = require('../modules/prompt_generator');

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
async function getPostImage(postData) {

    let postImage = await getAiImage(postData);

    return {postImage};
}


async function getAiImage(data) {
    const { eventDate, eventName, post, reference } = data;
    
    if (!reference || !reference.data || !reference.mimeType) {
        throw new Error("Missing valid Base64 image data (reference.data or reference.mimeType).");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    
    
    const systemPrompt = getPromptImage(); 

    const contextText = `
        Event date: ${eventDate},
        Event Name: ${eventName},
        Post Type: ${post.type},
        Post Date: ${post.date},
        Post Content: ${post.title}, ${post.content}
    `;

    // --- 2. Construct the Gemini API Payload ---
    const model = 'gemini-2.5-flash-image-preview';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
        config: {
            systemInstruction: systemPrompt // Use the dedicated field for instructions
        },
        contents: [{
            parts: [
                // Part 1: Detailed Text Context
                {
                    text: `Based on the following context, ${contextText}. Now, generate a high-quality, professional image of 4:5 aspect ratio that creatively represents the mood and content of this post. The image should be a direct output (no descriptive text):`
                },
                // Part 2: The Reference Image Data
                {
                    inlineData: {
                        mimeType: reference.mimeType,
                        data: reference.data, // The Base64 string
                    },
                },
            ],
        }],
    };

    console.log('AI image generation started for:', eventName);

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
        const generatedImagePart = result?.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (generatedImagePart && generatedImagePart.inlineData) {
            console.log("✅ AI image generated successfully.");
            
            // Return the necessary data for the client/server to save or display
            return {
                data: generatedImagePart.inlineData.data,
                mimeType: generatedImagePart.inlineData.mimeType
            };
        } else {
            const textOutput = result?.candidates?.[0]?.content?.parts?.find(part => part.text)?.text;
            console.warn("API was successful but returned no image. Model Text:", textOutput);
            return null; // Explicitly return null if no image is generated
        }

    } catch (error) {
        console.error('Error during AI image generation:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}



module.exports = { getPostImage };