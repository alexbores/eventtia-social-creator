import fetch from 'node-fetch'; 


export async function downloadImage(data) {
    
    let url = data



    try {
        console.log(`Proxying download request for: ${url}`);
        
        // 1. Fetch the image from the source (Server-to-Server bypasses CORS)
        const proxyResponse = await fetch(url);
        
        
        return proxyResponse;

    } catch (error) {
        console.error(`Download Proxy Fetch Error for ${url}:`, error.message);
        throw new Error(`Proxy fetch failed: ${error.message}`);
    }
}