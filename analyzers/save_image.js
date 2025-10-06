const path = require('path');
const fs = require('fs');

const fetch = require('node-fetch');


async function saveImage(imageData) {

    

    const apiKey = process.env.MEDIA_STORAGE_KEY;
    if (!apiKey) {
        throw new Error('MEDIA_STORAGE_KEY is not configured in .env file.');
    }
    
    // --- 1. Validate and Deconstruct Input Data ---
    const { data, mimeType, name} = JSON.parse(imageData);

    console.log(mimeType);
    console.log(name);

    if (!data || !mimeType || !name) {
        throw new Error('Invalid imageData structure. Must contain data, mimeType, and name.');
    }
    
    // --- 2. Create Blob from Base64 Data --
    
    // Convert Base64 string to a binary Uint8Array
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    const imageBlob = new Blob([array], { type: mimeType });

    // --- 3. Prepare Request Configuration ---
    const formData = new FormData();
    const apiURL = 'https://t83dhdfndo-staging.onrocket.site/wp-json/image-api/v1/upload-custom';

    
    // Append the Blob as a 'File' with its original name.
    // The 'file' key must match in the PHP $_FILES['file'].
    formData.append('file', new File([imageBlob], name, { type: mimeType })); 

    // --- 4. Send Request to WordPress API ---
    try {
        console.log(`Attempting to upload image: ${name} to WordPress.`);
        
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'X-Render-Secret': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('WordPress API Error:', errorBody);
            throw new Error(`Upload failed with status ${response.status}: ${errorBody.message || 'Server error.'}`);
        }

        const result = await response.json();
        console.log('Image saved successfully:', result);
        return result;

    } catch (error) {
        console.error('Failed to save image:', error);
        throw error;
    }
}


module.exports = { saveImage };