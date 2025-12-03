import path from 'path';
import fs from 'fs';


import fetch from 'node-fetch';

import { getPromptStandarizedSpeaker} from '../modules/prompt_generator.js';
import { getImageName,formatImage} from '../modules/image_handlers.js';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
export async function getStandarizedSpeaker(postData) {

    let speaker = await getAiImage(postData);

    return {speaker};
}


async function getAiImage(data) {
    const { imageUrl } = JSON.parse(data);
    
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
    


    let prompt = getPromptStandarizedSpeaker(data);

    // --- 2. Construct the Gemini API Payload ---
    const model = 'gemini-3-pro-image-preview'; 

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
        generationConfig: {
          responseModalities: ["TEXT","IMAGE"],
          temperature: 0.3,
          imageConfig: {
            aspectRatio: "4:5"
          },
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
            ],
        }],
    };

    console.log('AI image background generation started');

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
      console.log("AI Response");
      console.log(result);

      // FIX: Access candidates directly from the result object, not result[0]
      const candidates = result.candidates;
      
      if (!candidates || candidates.length === 0) {
          console.warn("API response contained no candidates.");
          return null;
      }

      // Find the part that contains inlineData (the image)
      const generatedImagePart = candidates[0].content?.parts?.find(part => part.inlineData);

      if (generatedImagePart && generatedImagePart.inlineData) {
          console.log("✅ AI image generated successfully.");
          
          // Return the necessary data for the client/server to save or display
          return {
              data: generatedImagePart.inlineData.data,
              mimeType: generatedImagePart.inlineData.mimeType
          };
      } else {
          // Fallback: Check if there was only text output (refusal or reasoning)
          const textOutput = candidates[0].content?.parts?.find(part => part.text)?.text;
          console.warn("API was successful but returned no image. Model Text:", textOutput);
          return null; 
      }

    } catch (error) {
        console.error('Error during AI image generation:', error);
        throw error; 
    }
}


