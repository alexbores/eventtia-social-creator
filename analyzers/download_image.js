import fetch from 'node-fetch'; // Required for making external HTTP requests in Node.js

/**
 * Acts as a server-side proxy to fetch an image from a URL, bypassing client-side CORS restrictions.
 * It fetches the raw file stream and returns the response object.
 *
 * @param {string} url The absolute URL of the image to fetch.
 * @returns {Promise<Response>} A Promise that resolves with the raw Node.js Fetch Response object, 
 * which contains the readable stream of the image data in its .body property.
 * @throws {Error} Throws if the URL is invalid or the external server returns an error status (4xx/5xx).
 */
export async function downloadImage(url) {
    if (typeof url !== 'string' || !url.startsWith('http')) {
        throw new Error("Invalid or non-absolute URL provided for download.");
    }

    try {
        console.log(`Proxying download request for: ${url}`);
        
        // 1. Fetch the image from the source (Server-to-Server)
        const proxyResponse = await fetch(url);
        
        // 2. Check for HTTP errors (404, 500, etc.)
        if (!proxyResponse.ok) {
            // Throw an error that includes the bad HTTP status code
            throw new Error(`Source server returned status ${proxyResponse.status}.`);
        }
        
        console.log(`Proxying download request successful`);
        // 3. Return the raw Response object containing the stream.
        return proxyResponse;

    } catch (error) {
        // Log the network error on the server
        console.error(`Download Proxy Fetch Error for ${url}:`, error.message);
        throw new Error(`Proxy fetch failed: ${error.message}`);
    }
}