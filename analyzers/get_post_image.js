const path = require('path');
const fs = require('fs');


const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const { generateImage } = require('../modules/AI_fetcher');
const { getPromptImage} = require('../modules/prompt_generator');

/**
 * Runs an AI-powered analysis using data previously captured by getWebData.
 * @param {object} webData - The data object from getWebData, containing screenshot paths and HTML.
 * @param {object} config - The centralized server configuration object.
 * @returns {Promise<object>} - The structured analysis report.
 */
async function getEventData(postData) {

    let postImage = await getAiImage(postData);

    return {postImage};
}


async function getAiImage(data) {

    let {eventDate, eventName ,post, reference} = data;


    const prompt = getPromptImage();
    
    let content = `
        Event date: ${eventDate},
        Event Name: ${eventName},
        Post Type: ${post.type},
        Post Date: ${post.date},
        Post Content: ${post.title},  ${post.content}

    `;


    let finalPrompt = `${prompt} 
                       \n\nHere is the post event content:\n\`\`\`html\n${content}\n\`\`\`
                       \n\nHere is the reference screenshot:\n\`\`\`html\n${reference}\n\`\`\`
                   `;
    
    let aiSummary = '';
    let cleanedString = '';


    console.log('AI image started');

    try {
        aiSummary = await getAIFetch('gemini', finalPrompt, []);
        console.log("AI says:", aiSummary);

        cleanedString = aiSummary.trim().slice(1, -1).replace(/^"|"$/g, '');
    
    } catch (error) {
        console.error('error in ai fetch: ',error);
        aiSummary = error.message;
    }

    return cleanedString;
}



module.exports = { getEventData };