
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
5.  **\`image\`** (string): The **full URL** of a relevant image from the website. **Do not repeat images.** If a full URL isn't available, use the relative path.
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
    "image": "https://example.com/images/[relevant_image_name].jpg",
    "hashtags": ["[#EventNameYYYY]", "#[PrimaryTopic]", "#[City]"],
    "type": "announcement"
  },
  {
    "id": 2,
    "date": "YYYY-MM-DD",
    "title": "[Post Type] Spotlight: Meet [Name]",
    "content": "[Exciting 2-5 sentence description of a specific event feature, like a speaker or activity, and why it's a must-see.]",
    "image": "https://example.com/images/[feature_specific_image].jpg",
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
    const prompt = `You are an expert image generation AI. Create a high-quality, professional image of 4:5 aspect ratio that creatively represents the mood and content of the following post.
    
    **Primary Directive:** Analyze the event post content and the screenshot of the landing page provided at the end of this prompt and generate an image based on that.
    

    ---
    ### ### Social post generator logic:

    1.  **Reference Image:** use the same design style, fonts, colors, and general tone from the image provided which is a screenshot of the event landing page.
    2.  **Image Content:** use the content provided at the end of the prompt to generate the actual image information, consider including the following topics if they are relevant to the post content.
        * ** Name of the event
        * ** Date of the event
        * ** Location of the event
        * ** Image refering to the event activities
        * ** Image with the same tone and style as the reference
        * ** Messages that encourage action and registration or participation, depending of the content at the end of the prompt
    3.  **Image Configuration: ** is extremly important that you apply and follow the following rules
        * ** Image ratio must absolutly be 4:5 aspect ratio, do not use any other aspect ratio than this one.
        * ** The attached file is just to have a reference of colors, mood styles and font family, but you must create a new image on your own.
        * ** You must focus on social media appeal including the content of the post shared in this prompt.

    
    Use the real information from the content provided.
    
    ### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than an image data
    * **DATA ONLY:** Your entire output **MUST** be a single image data.
    * **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the image.

    
    **This are the content and image reference, remember to not use the image just copy the style:**
    
    
    
    `;

    return prompt;
}
