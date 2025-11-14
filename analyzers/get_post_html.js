async function getAiAnalysis(data) {

    const { eventDate, eventName, postText, imageUrl, postImageUrl  } = JSON.parse(data);
    
    // 1. Get the Style Reference Image (Screenshot)
    let reference = null;
    try {
        reference = await formatImage(imageUrl, 'screenshot');
        if (!reference || !reference.data || !reference.mimeType) {
            throw new Error("Missing valid Base64 image data (reference.data or reference.mimeType).");
        }
    } catch(error) {
        throw new Error("Error formatting reference image: " + error.message);
    }

    // 2. Get the Background Image (for analysis)
    let background = null;
    try {
        background = await formatImage(postImageUrl, 'screenshot'); // You are correctly fetching this
        if (!background || !background.data || !background.mimeType) {
            throw new Error("Missing valid Base64 image data (background.data or background.mimeType).");
        }
    } catch(error) {
        throw new Error("Error formatting background image: " + error.message);
    }

    // 3. Prepare the prompt data
    let postPromptData = {
        eventDate,
        eventName,
        postText,
        postImageUrl 
    }

    const prompt = getPromptPostHTML(postPromptData);
    
    console.log('AI analysis started');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    const model = 'gemini-1.5-flash'; 
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
        generationConfig: {
            temperature: 0.5, 
            responseMimeType: "text/plain", 
        },
        contents: [{
            parts: [
                {
                    text: prompt
                },
                {
                    // Image 1: The Style Reference Screenshot
                    inlineData: {
                        mimeType: reference.mimeType,
                        data: reference.data,
                    },
                },
                {
                    // Image 2: The Background Image (for contrast analysis)
                    // This is correct based on your clarification.
                    inlineData: {
                        mimeType: background.mimeType,
                        data: background.data,
                    },
                },
            ],
        }],
    };

    // --- 5. Execute the API Call ---
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

        // 'result' will now be a SINGLE, complete JSON object
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