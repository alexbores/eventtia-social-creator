
export function getImageName(imageUrl) {
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


export async function formatImage(imageUrl,name){
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
        return {
            data: base64Data,
            mimeType: mimeType,
            name: name + '.' + extension 
        };
    
    } catch (error) {
        console.error("Image processing error:", error.message);
        
        return null;
    }
}