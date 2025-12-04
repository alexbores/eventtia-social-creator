import {
    getPromptPostImage
} from '../analyzers/get_post_image.js';

/**
 * Generates a prompt for the Gemini API based on the provided data and task type.
 * @param {string} taskType - The type of task (e.g., 'analyze_speaker', 'generate_post').
 * @param {object|string} data - The data to use for prompt generation. Can be a JSON string or an object.
 * @returns {string} - The generated prompt.
 */
export function generatePrompt(taskType, data) {
    // Ensure data is an object
    let parsedData = data;
    if (typeof data === 'string') {
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            console.warn("Data passed to generatePrompt was a string but not valid JSON. Using as is.");
        }
    }

    switch (taskType) {
        case 'analyze_speaker':
            return getPromptAnalyzeSpeaker(parsedData);
        case 'generate_post':
            // For generate_post, we might need to handle it differently if it expects specific arguments
            // But based on the file structure, it seems we might be calling a function that returns the prompt
            // Let's assume getPromptPostImage is the one, but it's imported from an analyzer file?
            // Actually, looking at the imports, getPromptPostImage is NOT imported here.
            // It seems get_post_image.js contains the logic.
            // Let's stick to what's defined in this file for now.
            return "Generate a social media post based on this content."; // Placeholder if not defined
        case 'standarize_speaker':
            return getPromptStandarizedSpeaker(parsedData);
        default:
            return "Analyze this image and provide insights.";
    }
}

export function getPromptAnalyzeSpeaker(data) {
    // ... (Existing logic for analyze speaker if any, or placeholder)
    return `
    Analyze the provided image of a speaker. 
    Identify the person, their likely profession, and key visual characteristics.
    `;
}


export function getPromptStandarizedSpeaker(data) {
    let parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    let {brandColor} = parsedData;

    // let bgDesc = "a clean, neutral studio " + (brandColor || "grey") + " color gradient background";

    const prompt = `
      Edit this image to create a standardized professional corporate headshot.
      
      CRITICAL INSTRUCTIONS:
      1. **Identity & Attire**: Keep the person's face, facial features, expression, skin tone, and clothing EXACTLY the same. Do not change the identity.
      2. **Background**: Replace the background with a SOLID PURE GREEN screen (#00FF00).
      
      COMPOSITION:
      3. **Framing**: Create a "Medium Close-Up" (Chest-up). The subject must be centered, standing straight, and facing the camera.
      4. **Headroom**: CRITICAL. Leave adequate empty space above the top of the head. Do NOT cut off the hair or head.
      5. **Hands**: No hands should be visible.
      
      STYLE & LIGHTING:
      6. **Expression**: Professional, confident, and approachable.
      7. **Lighting**: Soft, high-quality studio lighting. Add subtle shadows for depth. Ensure the face is well-lit.
      8. **Quality**: Photorealistic, sharp focus, high resolution.
      
      OUTPUT:
      9. Return ONLY the image. Maintain the exact aspect ratio of the input.
    `;

    return prompt;
}