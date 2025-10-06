import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { getAIFetch } from '../modules/AI_fetcher';
import { stripHtml } from '../modules/html_stripper';
import { getPromptRemadePosts } from '../modules/prompt_generator';

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
async function getPosts(data) {
    
    let items = await getAiAnalysis(data);

    items.map(item => {
      item.status = 'schedule'
    });

    return items;
}

async function getAiAnalysis(data) {
    
    data = JSON.parse(data);
    console.log('Event Data');
    console.log(data);

    const prompt = getPromptPosts();
    
    let finalPrompt = `${prompt} 
                       \n\nHere is the current date ${data.webData.currentDate}. 
                       \n\nHere is the date of the event ${data.webData.eventDate}. 
                       \n\nHere is the old name of the event ${data.webData.eventNameOld}. 
                       \n\nHere is the new name of the event ${data.webData.eventName}. 
                       \n\nHere is the page's content:\n\`\`\`\n${data.webData.content}\n\`\`\`.
                       \n\nHere is the current posts json:\n\`\`\`\n${data.posts}\n\`\`\``;
    
    let aiSummary = '';
    let cleanedJsonString = '';

    console.log(finalPrompt);


    console.log('AI analyis started');

    try {
        aiSummary = await getAIFetch('chatgpt', finalPrompt, []);
        console.log("AI says:", aiSummary);

        cleanedJsonString = aiSummary.trim();
        const firstBracket = cleanedJsonString.indexOf('[');
        const lastBracket = cleanedJsonString.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket > firstBracket) {
            cleanedJsonString = cleanedJsonString.substring(firstBracket, lastBracket + 1);
        }
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error.message;
    }

    let items;
    try {
        items = JSON.parse(cleanedJsonString);
    } catch (parseError) {
        console.error('Failed to parse the cleaned JSON string:', parseError);
        items = [{
            id: "error",
        }];
    }

    return items;
}



module.exports = { getPosts };