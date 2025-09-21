const fetch = require('node-fetch');

/**
 * Sends a prompt and optional images to the specified AI API (Gemini or ChatGPT).
 * @param {('gemini'|'chatgpt')} modelType - The AI model to use.
 * @param {string} promptText - The full prompt to send to the AI.
 * @param {Array<object>} [imageBuffers=[]] - An array of objects with a 'buffer' property for image data.
 * @returns {Promise<string>} A promise that resolves to the AI's text summary.
 */
async function getAIFetch(modelType, promptText, imageBuffers = []) {
    let apiKey, apiUrl, requestBody;
    let headers = { 'Content-Type': 'application/json' };

    // --- 1. CONFIGURE BASED ON MODEL TYPE ---
    if (modelType === 'gemini') {
        apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in .env file.');

        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const imageParts = imageBuffers.map(shot => ({
            inline_data: {
                mime_type: 'image/jpeg',
                data: shot.buffer.toString('base64')
            }
        }));
        
        requestBody = {
            contents: [{ parts: [{ text: promptText }, ...imageParts] }]
        };

    } else if (modelType === 'chatgpt') {
        apiKey = process.env.CHATGPT_API_KEY;
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('ChatGPT API key is missing or invalid in .env file.');
        }

        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`; // Add auth header

        const contentParts = [{ type: 'text', text: promptText }];
        imageBuffers.forEach(shot => {
            contentParts.push({
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${shot.buffer.toString('base64')}` }
            });
        });

        requestBody = {
            model: 'gpt-4o',
            messages: [{ role: 'user', content: contentParts }],
            max_tokens: 4096
        };

    } else {
        throw new Error(`Invalid modelType specified: '${modelType}'. Must be 'gemini' or 'chatgpt'.`);
    }

    // --- 2. EXECUTE THE API CALL ---
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            const errorMessage = modelType === 'chatgpt' ? (errorBody.error?.message || 'Unknown error') : (errorBody.error || 'Unknown error');
            console.error(`${modelType} API Error:`, errorMessage);
            throw new Error(`${modelType} API responded with status: ${response.status}`);
        }

        const result = await response.json();
        
        // --- 3. PARSE RESPONSE BASED ON MODEL TYPE ---
        let aiSummary;
        if (modelType === 'gemini') {
            aiSummary = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        } else { // chatgpt
            aiSummary = result?.choices?.[0]?.message?.content;
        }

        if (!aiSummary) {
            console.warn(`${modelType} response was valid but contained no text.`, JSON.stringify(result, null, 2));
            return '';
        }

        return aiSummary;

    } catch (error) {
        console.error(`Failed to get analysis from ${modelType}:`, error);
        throw error;
    }
}

// Export the single, unified function
module.exports = { getAIFetch };