
function generalPostText(){
  const text = `
    
    ---
### ### Content Generation Logic

1.  **Reference Date:** based on the current date provided at the end of the prompt and the date of the event given at the end of this prompt. Calculate all post dates relative to this.
2.  **Post Cadence:** Determine the number and frequency of posts based on the event's date:
    * **More than 1 month away:** Post once every 1-2 weeks (announcements, venue, city highlights).
    * **3-4 weeks away:** Post twice a week (speaker reveals, activity details, early-bird deadlines).
    * **Final 2 Week:** Post every 1-2 days (build hype, post reminders, ticket warnings).
    * **Final 3 Days:** Post daily, once per day until the event, creating urgency ("Tomorrow!", "Last chance!").
    * **Event Day:** Post at the start of the event ("It's happening now!").
3.  **Content Arc:** The posts must tell a story, starting broad and becoming more urgent.
    * **Phase 1 (Announcement):** General announcement of the event.
    * **Phase 2 (Details):** Highlight key features like speakers, activities, workshops, or sponsors.
    * **Phase 3 (Take Action):** Focus on ticket deadlines, "selling out soon," and final reminders.
4.  **Topics: ** Some important topics that have to be in some posts.
    * **General announcement including registration and tickets**
    * **Deadline to register: If the deadline is mentioned.**
    * **Program and activities.**
    * **Who are the speakers if any. if you dont have speakers skip this topic**
    * **About the venue**
    * **About the sponsors. if you dont have sponsors skip this topic**
    * **Reminder with practical details: 1 day before event**
    * **Reminder: Event day**
    * **1 day after the event: thank you post the day after the event, make a post thanking everyone for their participation, the type must be "thank_you"**



---
### ### JSON Object Schema

Each object in the array **MUST** contain these seven keys:

1.  **\`id\`** (number): A unique, sequential integer ID, starting at 1.
2.  **\`date\`** (string): The recommended posting date in \`YYYY-MM-DD\` format.
3.  **\`title\`** (string): A concise, engaging headline for the post (5-10 words).
4.  **\`content\`** (string): The post body, 2-5 sentences long. Use an enthusiastic and professional tone, include links to register to the event and the event data.
6.  **\`hashtags\`** (array of strings): An array of 3-5 relevant hashtags (e.g., \`["#EventName", "#Topic", "#City"]\`).
7.  **\`type\`** (string): The post category. Must be one of: \`announcement\`, \`speaker\`, \`activity\`, \`venue\`, \`deadline\`, \`reminder\`, \`urgency\`, \`event_day\`.

---
### ### Example Output Format

\\\`\\\`\\\`json
[
  {
    "id": 1,
    "date": "YYYY-MM-DD",
    "title": "🎉 [Catchy Announcement Title]!",
    "content": "[Engaging 2-5 sentence description of the event, what it is, and for whom.]",
    "hashtags": ["[#EventNameYYYY]", "#[PrimaryTopic]", "#[City]"],
    "type": "announcement"
  },
  {
    "id": 2,
    "date": "YYYY-MM-DD",
    "title": "[Post Type] Spotlight: Meet [Name]",
    "content": "[Exciting 2-5 sentence description of a specific event feature, like a speaker or activity, and why it's a must-see.]",
    "hashtags": ["[#SpecificTopic]", "#[FeatureType]", "#[EventName]"],
    "type": "speaker"
  }
]
\\\`\\\`\\\`

  `
  return text;
}


export function getPromptPosts() {
    const prompt = `You are a JSON generation service. Your function is to convert the provided event CONTENT into a single, raw JSON array of social media posts.

**Primary Directive:** Analyze the event html provided at the end of this prompt and generate a JSON array containing a social media posting schedule with generated content.


${generalPostText()}

but use the real information from the html provided and generate the content based on the context of the html

---
### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than a json

* **JSON ONLY:** Your entire output **MUST** be a single, valid, raw JSON array, not empty.
* **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the JSON array.
* **START/END CHARACTERS:** The absolute first character of your response must be \`[\` and the absolute last character must be \`]\`.


**Begin analysis. Process the following content:**

`;

    return prompt;
}

export function getPromptRemadePosts() {
    const prompt = `You are a JSON generation service. Your function is to convert the provided event CONTENT into a single, raw JSON array of social media posts.

**Primary Directive:** Analyze the event information provided at the end of this prompt and generate a JSON array containing a social media posting schedule with generated content.


${generalPostText()}


but use the real information from the content provided and generate the content based on that context,
prioritize the content that is already written in the provided json, if you can reuse the content form the json posts provided just check out for 
event name and event date those could be changed if needed and fill out null values.

---
### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than a json

* **JSON ONLY:** Your entire output **MUST** be a single, valid, raw JSON array, not empty.
* **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the JSON array.
* **START/END CHARACTERS:** The absolute first character of your response must be \`[\` and the absolute last character must be \`]\`.


**Begin analysis. Process the following content:**

`;

    return prompt;
}

export function getPromptContent() {
    const prompt = `You are a content cleaning service. Your function is to convert the provided event website HTML and Content into a single string of readable information.

**Primary Directive:** Analyze the event html and content provided at the end of this prompt and extract any valuable information in a single string.

Use the real information from the html and content provided do not invent or make up anything.

---
### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than a json

* **STRING ONLY:** Your entire output **MUST** be a single, valid, string.
* **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the JSON array.
* **START/END CHARACTERS:** The absolute first character of your response must be \`[\` and the absolute last character must be \`]\`.



**Begin analysis. Process the following HTML and content:**

`;

    return prompt;
}

export function getPromptDate() {
    const prompt = `You are a date finder service. Your function is to find the event date of the HTML event web received.

**Primary Directive:** Analyze the event html provided at the end of this prompt and find the date of the event.


---
### ### Example Output Format (only one item)

\\\`\\\`\\\`
YYYY-MM-DD
\\\`\\\`\\\`

Use the real information from the html provided.

---
### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than a json

* **DATE YYYY-MM-DD ONLY:** Your entire output **MUST** be a single, date format.
* **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the JSON array.
* **START/END CHARACTERS:** The absolute first character of your response must be \`[\` and the absolute last character must be \`]\`.



**Begin analysis. Process the following HTML content:**



`;

    return prompt;
}

export function getPromptName() {
    const prompt = `You are a event name finder service. Your function is to find the event name of the HTML event web received.

**Primary Directive:** Analyze the event html provided at the end of this prompt and find the name of the event.


---
### ### Example Output Format (only one item)

\\\`\\\`\\\`
Event Name
\\\`\\\`\\\`

Use the real information from the html provided.

---
### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than a json

* **NAME STRING ONLY:** Your entire output **MUST** be a single, string format.
* **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the JSON array.
* **START/END CHARACTERS:** The absolute first character of your response must be \`[\` and the absolute last character must be \`]\`.



**Begin analysis. Process the following HTML content:**



`;

    return prompt;
}


export function getPromptImage() {
    const prompt = `
       You are a senior social media graphic designer tasked with creating a compelling promotional image template for an event to be posted on Instagram with no text.
       
       **Objective:**
       Generate a high-quality, professional image with a 4:5 aspect ratio. The image must attract attention, It will be based on provided text content and a stylistic reference image (a screenshot of the event's landing page).
       
       ---
       ### ### Generation Logic (Follow these steps precisely):
       
       **Step 1: Analyze Style Reference**
       First, meticulously analyze the provided reference image. Your goal is to extract its aesthetic DNA. Identify the following stylistic elements:
       - **Color Palette:** The primary and secondary colors used.
       - **Texts:** do not use text in this image.
       - **Visual Elements:** Any recurring shapes, patterns, textures, or graphic motifs.
       - **Overall Mood:** The general tone and feeling (e.g., professional, energetic, minimalist).
       
       **Step 2: Create a New Composition**
       This is the most critical step. You must **completely disregard the layout, subject matter, and composition** of the reference image. Your task is to generate a **brand new, original image from scratch**. This is a style transfer task that includes the real logos and people images, NOT an image editing task.
       
       **Step 3: Synthesize and Generate the New Image**
       Now, apply the **style** from Step 1 to create the new image. The new image must include:
       - A dynamic and engaging composition that is visually appealing for a social media feed but with no text.
       - All visual elements (colors, graphics) must strictly adhere to the style identified in Step 1.
       - If the content is about speakers then use the real photo of the persons from the screenshot.
       - use the same logo as in the reference with no edits.
       
       ---
       ### ### Strict Output Rules (Adhere Absolutely):
       
       1.  **Aspect Ratio:** The final image's aspect ratio **MUST be 4:5**. Do not use any other ratio. [2, 1]
       2.  **Originality:** The reference image is for **style inspiration ONLY**. Do not edit, alter, or use the layout of the reference image. You must create a completely new visual. [3]
       3.  **DATA ONLY:** Your entire output **MUST** be a single image data object.
       4.  **NO EXTRA TEXT:** Do **NOT** include any text, explanations, comments, or markdown formatting (like \`\`\`json\`\`\`) before or after the image data.
       
       **This is the content and the event page**
    
    `;

    return prompt;
}

export function getPromptTextImage() {
    const prompt = `
       You are a senior social media graphic designer tasked with creating a compelling promotional image for an event to be posted on Instagram.
       
       **Objective:**
       Generate a high-quality, professional image with a 4:5 aspect ratio. The image must attract attention, convey key event details, and encourage followers to register. It will be based on provided text content and a stylistic reference image (a screenshot of the event's landing page).
       
       ---
       ### ### Generation Logic (Follow these steps precisely):
       
       **Step 1: Analyze Style Reference**
       First, meticulously analyze the provided reference image. Your goal is to extract its aesthetic DNA. Identify the following stylistic elements:
       - **Color Palette:** The primary and secondary colors used.
       - **Typography:** Font families, styles (e.g., serif, sans-serif), weights (e.g., bold, regular), and casing.
       - **Visual Elements:** Any recurring shapes, patterns, textures, or graphic motifs.
       - **Overall Mood:** The general tone and feeling (e.g., professional, energetic, minimalist).
       
       **Step 2: Extract Core Content**
       Next, analyze the provided text content to identify the essential information that must be included in the new image:
       - Event Name
       - Event Date
       - Event Location
       - Key promotional message or theme.
       - Speakers if any.
       
       **Step 3: Create a New Composition**
       This is the most critical step. You must **completely disregard the layout, subject matter, and composition** of the reference image. Your task is to generate a **brand new, original image from scratch**. This is a style transfer task, NOT an image editing task.
       
       **Step 4: Synthesize and Generate the New Image**
       Now, combine the **style** from Step 1 with the **content** from Step 2 to create the new image. The new image must include:
       - The **Event Name**, **Date**, and **Location** rendered clearly and legibly. [1]
       - A prominent Call-to-Action (CTA): **"Register Now"**, the style must be identical to the one on the website.
       - The **event organizer's logo** as seen on the reference page.
       - A dynamic and engaging composition that is visually appealing for a social media feed.
       - All visual elements (fonts, colors, graphics) must strictly adhere to the style identified in Step 1.
       - If the content is about speakers then use the real photo of the persons from the reference do not invent images for speakers.
       - use the same logo as in the reference with no edits.
       - do not add icons and layout of a webpage, this is an advertisment post image for social media.
       - The mayority of the text must come from the post context shared at the end.
       - all texts must be valid real texts. 
       
       ---
       ### ### Strict Output Rules (Adhere Absolutely):
       
       1.  **Aspect Ratio:** The final image's aspect ratio **MUST be 4:5**. Do not use any other ratio. [2, 1]
       2.  **Originality:** The reference image is for **style inspiration ONLY**. Do not edit, alter, or use the layout of the reference image. You must create a completely new visual. [3]
       3.  **DATA ONLY:** Your entire output **MUST** be a single image data object.
       4.  **NO EXTRA TEXT:** Do **NOT** include any text, explanations, comments, or markdown formatting (like \`\`\`json\`\`\`) before or after the image data.
       
       **This is the content and the event page**
    
    `;

    return prompt;
}

export function getPromptEditImage() {
    const prompt = `
       You are a senior social media graphic designer tasked with editing a compelling promotional image for an event to be posted on Instagram.
       
       **Objective:**
       Edit a high-quality, professional image with a 4:5 aspect ratio. The image must attract attention, convey key event details, and encourage followers to register. It will be based on provided text content and a reference image.
       
       ---
       ### ### Generation Logic (Follow these steps precisely):
       
       **Step 1: Analyze Style Reference**
       First, meticulously analyze the provided reference image. Your goal is to extract its aesthetic DNA. Identify the following stylistic elements:
       - **Color Palette:** The primary and secondary colors used.
       - **Typography:** Font families, styles (e.g., serif, sans-serif), weights (e.g., bold, regular), and casing.
       - **Visual Elements:** Any recurring shapes, patterns, textures, or graphic motifs.
       - **Overall Mood:** The general tone and feeling (e.g., professional, energetic, minimalist).
       
       **Step 2: Analyze the prompt**
       Next, analyze the provided prompt at the end to identify the essential information that must be included or edited in the new image.
       
       **Step 3: Create a New Composition**
       This is the most critical step. You must apply the new indications to the image with out changing any further information, This is a an image editing task, but only the small image not the screenshot that is only for reference.
       there is also context included if needed for reference but give priprity to the prompt indications at the end.

       ---
       ### ### Strict Output Rules (Adhere Absolutely):
       
       1.  **Aspect Ratio:** The final image's aspect ratio **MUST be 4:5**. Do not use any other ratio. [2, 1]
       2.  **Editing:** The reference image is for editing. You must apply the rules provided at the end without changing any more of the image. [3]
       3.  **DATA ONLY:** Your entire output **MUST** be a single image data object.
       4.  **NO EXTRA TEXT:** Do **NOT** include any text, explanations, comments, or markdown formatting (like \`\`\`json\`\`\`) before or after the image data.
       
       **This is the prompt the context the reference image and the screenshot of the webpage for visual styles:**
    
    `;

    return prompt;
}
