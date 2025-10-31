import fetch from 'node-fetch'; 


export async function downloadImage(url, fileName) {
    if (!url || !fileName) {
        throw new Error("URL and filename are required for proxy download.");
    }

    try {
        console.log(`Proxying download request for: ${url}`);
        
        // 1. Fetch the image from the source (Server-to-Server bypasses CORS)
        const proxyResponse = await fetch(url);
        
        if (!proxyResponse.ok) {
            // Throw an error if the source image server fails (e.g., 404, 500)
            throw new Error(`Source server returned status ${proxyResponse.status}`);
        }

        // We return the raw Response object. The Express wrapper will handle
        // setting Content-Disposition and piping the body to the client response (res).
        return proxyResponse;

    } catch (error) {
        console.error(`Download Proxy Fetch Error for ${url}:`, error.message);
        throw new Error(`Proxy fetch failed: ${error.message}`);
    }
}