
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
5.  ** language: ** the content generated must have the same language used in the content provided.



---
### ### JSON Object Schema

Each object in the array **MUST** contain these seven keys:

1.  **\`id\`** (number): A unique, sequential integer ID, starting at 1.
2.  **\`date\`** (string): The recommended posting date in \`YYYY-MM-DD\` format.
3.  **\`title\`** (string): A concise, engaging headline for the post (5-10 words).
4.  **\`content\`** (string): The post body, 2-5 sentences long. Use an enthusiastic and professional tone, include links to register to the event and the event data.
6.  **\`hashtags\`** (array of strings): An array of 3-5 relevant hashtags (e.g., \`["#EventName", "#Topic", "#City"]\`).
7.  **\`type\`** (string): The post category. Must be one of: \`announcement\`, \`speaker\`, \`activity\`, \`venue\`, \`deadline\`, \`reminder\`, \`urgency\`, \`event_day\`.
8.  **\`phrase\`** (string): A powerfull sentence resuming all the content and title to use in social media, NO hashtags.

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
    "type": "announcement",
    "phrase": "[sentence for social]",
  },
  {
    "id": 2,
    "date": "YYYY-MM-DD",
    "title": "[Post Type] Spotlight: Meet [Name]",
    "content": "[Exciting 2-5 sentence description of a specific event feature, like a speaker or activity, and why it's a must-see.]",
    "hashtags": ["[#SpecificTopic]", "#[FeatureType]", "#[EventName]"],
    "type": "speaker",
    "phrase": "[sentence for social]",
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

The text generated must match the language of the provided content html.

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


export function getPromptImage(data) {
    const {eventDate, eventName, postText} = data;

    const prompt = `
       You are a senior social media graphic designer tasked with creating a compelling promotional image template for an event to be posted on Instagram with no text.
       
       **Objective:**
       Generate a high-quality, professional image with a 4:5 aspect ratio. The image must attract attention, It will be based on provided text content and a stylistic reference image (a screenshot of the event's landing page).
       
       ---
       ### ### Generation Logic (Follow these steps precisely):
       
       **Step 1: Analyze Style Reference**
       First, meticulously analyze the provided reference image. Your goal is to extract its aesthetic DNA. Identify the following stylistic elements:
       - **Color Palette:** The primary and secondary colors used.
       - **Texts:** do not use any text in this image.
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
       
       **This is the content and the event page screenshot**

        **post context for reference if needed:**
        * ** Event date: ${eventDate},
        * ** Event Name: ${eventName},
        * ** Post Content: ${postText}
    `;

    return prompt;
}

export function getPromptTextImage(data) {


    const {eventDate, eventName, postText} = data;

    const prompt = `
       You are a senior social media graphic designer tasked with creating a compelling promotional image for an event to be posted on Instagram.
       
       **Objective:**
       Generate a high-quality, professional image with a 4:5 aspect ratio. The image must attract attention, convey key event details, and encourage followers to register. It will be based on a stylistic reference image (a screenshot of the event's landing page).
       
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
       - A prominent Call-to-Action (CTA) text: convey action to register or go to the event, the language must match the content language.
       - Do not add logos of any kind.
       - A dynamic and engaging composition that is visually appealing for a social media advertisment.
       - All visual elements (fonts, colors, graphics) must strictly adhere to the style identified in Step 1.
       - If and only if the content text is about speakers then use the real photo of the persons from the reference do not create fake people for speakers.
       - do not add icons and layout like a webpage, this is an advertisment post image for social media so no icons needed.
       - Use EXACTLY this texts "${postText}" with no modifications for the information.
       - Use EXACTLY this text to show the date "${eventDate}" and do not add more text.
       - Use EXACTLY this text to show the event name "${eventName}"
 
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


export function getPromptIdentity(data) {
    const {html} = data;

    const prompt = `<SYSTEM_ROLE>
You are an expert Brand Identity Analyzer and Senior Front-End Developer.
Your task is to reverse-engineer the design system from the provided <INPUT_DATA> (HTML and/or Image) and output a strict JSON object.
</SYSTEM_ROLE>

<TASK_DEFINITION>
1.  **Analyze** the CSS/HTML within the provided code to find \`font-family\` definitions and color codes (hex, rgb, variables).
2.  **Analyze** the visual hierarchy to determine which colors and fonts are dominant versus accents.
3.  **Map** any custom or obscure fonts to their closest Google Font equivalent.
4.  **Synthesize** findings into the specific JSON structure defined below.
</TASK_DEFINITION>

<EXTRACTION_LOGIC>
**COLORS:**
* **Primary Color:** The most dominant brand color. Often found in the navbar background, primary buttons, or the logo. (Prefer Hex format, e.g., #FF5733).
* **Secondary Color:** The accent color used for highlights, links, or secondary buttons. If the site is monochrome, use the primary text color (often dark grey/black) or the background color if inverted.

**FONTS:**
* **Title Font:** The \`font-family\` used for \`<h1>\`, \`<h2>\`, or hero typography. Clean the string (remove 'sans-serif', etc.) to get the font name.
* *Title style:* The css styles used for \`<h1>\`, \`<h2>\`, or hero, get main colors, shadows if any but disregard font-size and letter-spacing.
* **Text Font:** The \`font-family\` used for \`<p>\`, \`<body>\`, or \`<span>\`.
* *Note:* If the font is generic (e.g., "system-ui"), identify the closest Google Font style.
</EXTRACTION_LOGIC>

<JSON_OUTPUT_SCHEMA>
{
  "colors": {
    "primary_color": "string (Hex Code)",
    "secondary_color": "string (Hex Code)"
  },
  "fonts": {
    "title_font": "string (Font Name)",
    "title_style": "string (CSS rules)",
    "text_font": "string (Font Name)"
  }
}
</JSON_OUTPUT_SCHEMA>

<STRICT_OUTPUT_RULES>
1.  **FORMAT:** Return ONLY valid, parseable JSON.
2.  **NO WRAPPERS:** Do not use markdown code blocks (no \`\`\`json). Just the raw JSON string.
3.  **NO CHATTER:** Do not include explanations, "Here is the JSON", or any other text.
4.  **DEFAULTS:** If data is completely missing, default to: Colors: #000000/#FFFFFF, Fonts: "Inter"/"Inter".
</STRICT_OUTPUT_RULES>

<INPUT_DATA>
* Reference HTML/Context: ${html}
* Style_Reference_Image: [Image provided via API input]
</INPUT_DATA>

ANALYZE AND RETURN JSON.
`;

    return prompt;
}



export function getPromptImageNew() {

    const prompt = `
<SYSTEM_ROLE>
You are an advanced image generation service.
Your task is to create a compelling, brand-aligned background image.
This image will be used as a background for a social media post, adhering strictly to a provided style reference.
</SYSTEM_ROLE>

<IMAGE_GENERATION_TASK>
  <INPUT_ANALYSIS>
    <PRIMARY_REFERENCE>
      <INPUT_IMAGE_TYPE>Style_Reference_Screenshot</INPUT_IMAGE_TYPE>
      <INSTRUCTION>Analyze the provided screenshot for its aesthetic DNA.</INSTRUCTION>
      <EXTRACT_ELEMENTS>
        <ELEMENT_TYPE>color_palette</ELEMENT_TYPE>
          <SUB_ELEMENTS>
            <COLOR_SCHEME>primary, secondary, accent colors</COLOR_SCHEME>
            <COLOR_QUALITIES>vibrancy, saturation, luminosity</COLOR_QUALITIES>
          </SUB_ELEMENTS>
        <ELEMENT_TYPE>mood_tone</ELEMENT_TYPE>
      </EXTRACT_ELEMENTS>
    </PRIMARY_REFERENCE>
  </INPUT_ANALYSIS>

  <COMPOSITION_STRATEGY>
    <MANDATORY_ACTION>Create a **brand new, original, abstract digital composition**.</MANDATORY_ACTION>
    <MANDATORY_CONSTRAINT>DO NOT replicate the layout or text objects from the <INPUT_IMAGE_TYPE>Style_Reference_Screenshot</INPUT_IMAGE_TYPE>.</MANDATORY_CONSTRAINT>
    <MANDATORY_FUNCTION>The output is a **style-transfer-ONLY** task, focused on aesthetic replication, NOT an image-editing or layout-duplication task.</MANDATORY_FUNCTION>
  </COMPOSITION_STRATEGY>

  <OUTPUT_IMAGE_CONTENT>
    <MAIN_FOCUS>A dynamic, engaging, and visually appealing **background image** suitable for brand use.</MAIN_FOCUS>
    <STYLE_ADHERENCE>All visual elements (colors, abstract shapes, textures, lighting, composition flow) MUST strictly adhere to the <ELEMENT_TYPE>color_palette</ELEMENT_TYPE>, <ELEMENT_TYPE>mood_tone</ELEMENT_TYPE>, and <ELEMENT_TYPE>key_visual_motifs</ELEMENT_TYPE> identified from the <INPUT_IMAGE_TYPE>Style_Reference_Screenshot</INPUT_IMAGE_TYPE>.</STYLE_ADHERENCE>
    <NEGATIVE_CONSTRAINTS>
      <PROHIBIT_ELEMENT>text</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>words</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>numbers</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>dates</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>typography</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>logos</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>icons</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>brand marks</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>human figures</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>recognizable objects</PROHIBIT_ELEMENT>
    </NEGATIVE_CONSTRAINTS>
  </OUTPUT_IMAGE_CONTENT>
</IMAGE_GENERATION_TASK>

<STRICT_OUTPUT_RULES>
  <OUTPUT_FORMAT>Generate a single image.</OUTPUT_FORMAT>
  <ASPECT_RATIO>The final image aspect ratio MUST be **4:5**. No other ratio.</ASPECT_RATIO>
  <ORIGINALITY_CONSTRAINT>The reference image is for STYLE_INSPIRATION ONLY. DO NOT edit, alter, or use the layout/composition of the reference image.</ORIGINALITY_CONSTRAINT>
  <NO_ADDITIONAL_OUTPUT>DO NOT include any explanatory text, comments, or markdown (e.g., \`\`\`json\`\`\`) before or after the image generation.</NO_ADDITIONAL_OUTPUT>
</STRICT_OUTPUT_RULES>

<INPUT_DATA>
  <FIELD_NAME>Style_Reference_Screenshot</FIELD_NAME>
  <FIELD_VALUE>[Image provided via API input]</FIELD_VALUE>
</INPUT_DATA>

GENERATE_IMAGE.
`;

    return prompt;
}

export function getPromptPostHTML(data) {

    let {eventDate, 
           eventName,
           postText,
           postImageUrl,
           logoUrl,
           referenceHTML,
           titleFont,
           textFont,
           primaryColor,
           secondaryColor,
           titleStyle,
        } = data;

    let referencePrompt = "";
    
    if(referenceHTML != null){
        referencePrompt = `
          7.  **REFERENCE_HTML:
              * Use this code as a reference to create the html, use it as inspiration, it should be similar on style and harmonius but not exactly the same:
              * reference HTML: ${referenceHTML}
        `;
    }

    const prompt = `
<SYSTEM_ROLE>
You are an expert front-end developer and Awwwards designer winner and very bold creative digital social media designer.
Your task is to generate a single HTML file.
</SYSTEM_ROLE>

<TASK_DEFINITION>
1.  **Analyze** the provided <INPUT_DATA> (text and background URL).
2.  **Analyze** the provided input <style-reference-image> (the screenshot).
3.  **Synthesize** these inputs to generate a single HTML file for a social media post.
4.  **Prioritize** the <AESTHETIC_GOAL> over the <style-reference-image>. The image is for *hints*, the goal is the primary creative direction.
5.  **Colors** the primary color is \`${primaryColor}\`, the secondary is \`${primaryColor}\`.
</TASK_DEFINITION>

<AESTHETIC_GOAL>
* **DESIGN_STYLE:** 'creative', 'bold', 'modern', 'artistic', 'high-impact'
* **QUALITY_BENCHMARK:** 'Awwwards-level', 'premium-design-agency'
* **LAYOUT:** 'asymmetric-but-balanced', 'unconventional-but-readable'
* **TYPOGRAPHY:** 'professional', 'modern', 'experimental', 'variable-weights-spacing'
</AESTHETIC_GOAL>

<DESIGN_REQUIREMENTS>
1.  **CONTAINER:** A single wrapper element with a strict 4:5 aspect ratio (e.g., \`width: 1080px; height: 1350px;\`). This is a critical requirement.
2.  **MAIN_IMAGE:**
    * Use exact URL: \`${postImageUrl}\` and no variables.
    * CSS: \`background-image: url('${postImageUrl}');\`
    * CSS: \`background-size: cover;\`
    * CSS: \`background-position: center;\`
    * Include the image element in a creative way if possible, the image is not informational.
3.  **TEXT_CONTENT (MUST INCLUDE):**
    * \`<h1>\`: Large, primary title, use exact font: \`${titleFont}\` and take into account this styles \`${titleStyle}\`.
    * \`<p>\`: big (minimun font-size: 2.3rem), complement text, use exact font: \`${textFont}\`.
    * \`<p class="cta">\`: Actionable text (Call-to-Action). not interactable.
    * **Event Date Data:** \`<p class="date-text">\`: ${eventDate}.
    * **Event Title Data:** ${eventName}
    * **Event Complement Data:** ${postText} 
    * All text must NOT overflow the container of 1350px.
    * All text must be easy to read if overlayed the main image.
4.  **FONTS:**
    * **MUST** import fonts in the \`<style>\` tag using \`@import url(...);\` from google.
5.  **LOGO_IMAGE: (MUST INCLUDE): **
    * Use exact URL: \`${logoUrl}\` in \`<img>\` element.
6.  **OTHER_RULES:
    * DO NOT add animations.
    * DO NOT add interactive elements.
    * All main text must be horizontal oriented an very visible.
    * Use Flexbox css.
    * All text must not overflow the container.
${referencePrompt}

</DESIGN_REQUIREMENTS>

<STRICT_OUTPUT_RULES>
1.  **FILE_FORMAT:** SINGLE, valid HTML string ONLY.
2.  **CSS_METHOD:** ALL CSS MUST be embedded in a single \`<style>\` tag inside the \`<head>\`.
3.  **NO_EXTRA_TEXT:** NO markdown (e.g., \`\`\`html\`), NO comments, NO explanations.
4.  **START_TOKEN:** The response MUST start *exactly* with \`<!DOCTYPE html>\`.
5.  **END_TOKEN:** The response MUST end *exactly* with \`</html>\`.
</STRICT_OUTPUT_RULES>

<INPUT_DATA>
* Event_Date: ${eventDate}
* Event_Name: ${eventName}
* Post_Content: ${postText}
* Background_Image_URL: ${postImageUrl}
* Style_Reference_Image: [Image provided via API input]
</INPUT_DATA>

GENERATE.
`;

    return prompt;
}






export function getPromptBackgroundImage() {

    const prompt = `
<SYSTEM_ROLE>
You are an expert abstract digital artist specialising in creating **pure, clean background textures**.
Your sole task is to analyze the *aesthetic vibe* (colors, lighting, mood) of a reference image and generate a completely new, abstract background that embodies that vibe, ensuring it is 100% free of any symbolic or informational content.
</SYSTEM_ROLE>

<IMAGE_GENERATION_TASK>
  <INPUT_ANALYSIS>
    <PRIMARY_REFERENCE>
      <INPUT_IMAGE_TYPE>Style_Reference_Screenshot</INPUT_IMAGE_TYPE>
      <INSTRUCTION_STYLE>Extract only the abstract qualities: color palette, gradients, lighting, and textural feel.</INSTRUCTION_STYLE>
      <INSTRUCTION_IGNORE>CRITICAL: Actively IGNORE all shapes that resemble letters, numbers, words, logos, or icons in the reference image. Do not treat them as features to be replicated.</INSTRUCTION_IGNORE>
    </PRIMARY_REFERENCE>
  </INPUT_ANALYSIS>

  <CRITICAL_CONSTRAINT_ZERO_TOLERANCE>
    <RULE>There is ZERO TOLERANCE for text or numbers in the final output.</RULE>
    <ACTION>If the generative process attempts to create a shape that looks like a letter, number, or symbol, immediately dissolve that shape into pure abstract color and texture.</ACTION>
    <RESULT_CHECK>The final image must be entirely asemic (having no semantic content like words or symbols).</RESULT_CHECK>
  </CRITICAL_CONSTRAINT_ZERO_TOLERANCE>

  <COMPOSITION_STRATEGY>
    <MANDATORY_ACTION>Create a **new, original abstract composition** based *only* on the extracted colors and mood.</MANDATORY_ACTION>
    <MANDATORY_CONSTRAINT>The output must be a seamless, clean background texture suitable for web design.</MANDATORY_CONSTRAINT>
    <STYLE_TRANSFER_MODE>Pure aesthetic replication only. Do NOT perform layout replication.</STYLE_TRANSFER_MODE>
  </COMPOSITION_STRATEGY>

  <OUTPUT_IMAGE_CONTENT>
    <MAIN_FOCUS>A clean, highly-refined abstract background texture.</MAIN_FOCUS>
    <VISUAL_QUALITY>Smooth gradients, abstract shapes, and rich colors matching the reference, but with a "clean slate" appearance.</VISUAL_QUALITY>
    <NEGATIVE_CONSTRAINTS>
      <PROHIBIT_ABSOLUTE>text, words, letters, glyphs, typography of any kind</PROHIBIT_ABSOLUTE>
      <PROHIBIT_ABSOLUTE>numbers, digits, dates, numerical sequences</PROHIBIT_ABSOLUTE>
      <PROHIBIT_ABSOLUTE>logos, icons, symbols, watermarks, brand marks</PROHIBIT_ABSOLUTE>
    </NEGATIVE_CONSTRAINTS>
  </OUTPUT_IMAGE_CONTENT>
</IMAGE_GENERATION_TASK>

<STRICT_OUTPUT_RULES>
  <OUTPUT_FORMAT>Generate a single image.</OUTPUT_FORMAT>
  <NO_ADDITIONAL_OUTPUT>DO NOT include any explanatory text or markdown.</NO_ADDITIONAL_OUTPUT>
</STRICT_OUTPUT_RULES>

<INPUT_DATA>
  <FIELD_NAME>Style_Reference_Screenshot</FIELD_NAME>
  <FIELD_VALUE>[Image provided via API input]</FIELD_VALUE>
</INPUT_DATA>

GENERATE_IMAGE.
`;

    return prompt;
}


export function getPromptRefineBackgroundImage() {

    const prompt = `
<SYSTEM_ROLE>
You are an expert image editing and in-painting service.
Your task is to take a provided reference image and meticulously remove all textual and symbolic elements, while preserving the original background and overall aesthetic.
</SYSTEM_ROLE>

<IMAGE_EDITING_TASK>
  <INPUT_ANALYSIS>
    <PRIMARY_REFERENCE>
      <INPUT_IMAGE_TYPE>Image_To_Clean</INPUT_IMAGE_TYPE>
      <INSTRUCTION>Analyze the provided image for all instances of text, numbers, letters, and icons/logos.</INSTRUCTION>
      <IDENTIFY_ELEMENTS>
        <ELEMENT_TYPE>textual_content</ELEMENT_TYPE>
        <SUB_ELEMENTS>
          <TEXT_TYPES>all fonts, words, phrases, sentences, paragraphs</TEXT_TYPES>
          <NUMBER_TYPES>all digits, numerical sequences, dates</NUMBER_TYPES>
          <LETTER_TYPES>all individual letters, characters</LETTER_TYPES>
        </SUB_ELEMENTS>
        <ELEMENT_TYPE>symbolic_content</ELEMENT_TYPE>
        <SUB_ELEMENTS>
          <ICON_TYPES>all graphical icons, UI elements that convey meaning</ICON_TYPES>
          <LOGO_TYPES>all brand logos, brand marks, watermarks</LOGO_TYPES>
        </SUB_ELEMENTS>
      </IDENTIFY_ELEMENTS>
    </PRIMARY_REFERENCE>
  </INPUT_ANALYSIS>

  <EDITING_STRATEGY>
    <MANDATORY_ACTION>Perform **in-painting / content-aware fill** to remove identified elements.</MANDATORY_ACTION>
    <MANDATORY_CONSTRAINT>The goal is to make the removed areas seamlessly blend with the surrounding background.</MANDATORY_CONSTRAINT>
    <MANDATORY_CONSTRAINT>Maintain the original image's resolution, aspect ratio, color palette, textures, and overall mood.</MANDATORY_CONSTRAINT>
    <MANDATORY_CONSTRAINT>DO NOT introduce new elements, objects, or significant stylistic changes.</MANDATORY_CONSTRAINT>
    <CONDITIONAL_ACTION>If no textual or symbolic content is found, return the original image with **zero or minimal imperceptible modifications**.</CONDITIONAL_ACTION>
  </EDITING_STRATEGY>

  <OUTPUT_IMAGE_CONTENT>
    <MAIN_FOCUS>The original image, but with all text, numbers, letters, icons, and logos expertly removed.</MAIN_FOCUS>
    <VISUAL_PRIORITY>Prioritize the integrity and continuity of the original background and visual style.</VISUAL_PRIORITY>
    <NEGATIVE_CONSTRAINTS>
      <PROHIBIT_ELEMENT>new text</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new words</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new numbers</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new dates</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new typography</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new logos</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new icons</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new brand marks</PROHIBIT_ELEMENT>
      <PROHIBIT_ELEMENT>new human figures (unless part of the original background and untouched)</PROHIBIT_ELEMENT>
      <PROHIBIT_CHANGE>alteration of original image's aspect ratio</PROHIBIT_CHANGE>
      <PROHIBIT_CHANGE>stylistic transformation</PROHIBIT_CHANGE>
      <PROHIBIT_CHANGE>layout modification</PROHIBIT_CHANGE>
    </NEGATIVE_CONSTRAINTS>
  </OUTPUT_IMAGE_CONTENT>
</IMAGE_EDITING_TASK>

<STRICT_OUTPUT_RULES>
  <OUTPUT_FORMAT>Generate a single image.</OUTPUT_FORMAT>
  <ASPECT_RATIO>The final image MUST retain the **original aspect ratio** of the input image.</ASPECT_RATIO>
  <ORIGINALITY_CONSTRAINT>The output image IS a direct modification of the input reference image.</ORIGINALITY_CONSTRAINT>
  <NO_ADDITIONAL_OUTPUT>DO NOT include any explanatory text, comments, or markdown (e.g., \`\`\`json\`\`\`) before or after the image generation.</NO_ADDITIONAL_OUTPUT>
</STRICT_OUTPUT_RULES>

<INPUT_DATA>
  <FIELD_NAME>Image_To_Clean</FIELD_NAME>
  <FIELD_VALUE>[Image provided via API input]</FIELD_VALUE>
</INPUT_DATA>

GENERATE_IMAGE.
`;

    return prompt;
}




export function getPromptPrimaryColors() {

    const prompt = `<SYSTEM_ROLE>
You are an expert Brand Identity Analyzer.
Your task is to analyze the design system from the provided <INPUT_DATA> Image and output a strict JSON object.
</SYSTEM_ROLE>

<TASK_DEFINITION>
2.  **Analyze** the visual hierarchy to determine which colors are dominant.
4.  **Synthesize** findings into the specific JSON structure defined below.
</TASK_DEFINITION>

<EXTRACTION_LOGIC>
**COLORS:**
* **Primary Color:** The most dominant brand color. (Hex format, e.g., #FF5733), avoid getting whites and blacks if there are not part of the actual brand, get the percentage of usage of this color versus the secondary.
* **Secondary Color:** The second most dominant used brand color (Hex format, e.g., #FF5733), avoid getting whites and blacks if there are not part of the actual brand, get the percentage of usage of this color versus the primary.


</EXTRACTION_LOGIC>

<JSON_OUTPUT_SCHEMA>
{
  "colors": [
    {
      "hex": "string (Hex Code for primary color)",
      "percentage": "float (Percentage of primary color)"
    },
    {
      "hex": "string (Hex Code for secondary color)",
      "percentage": "float (Percentage of secondary color)"
    }
  ],
}
</JSON_OUTPUT_SCHEMA>

<STRICT_OUTPUT_RULES>
1.  **FORMAT:** Return ONLY valid, parseable JSON.
2.  **NO WRAPPERS:** Do not use markdown code blocks (no \`\`\`json). Just the raw JSON string.
3.  **NO CHATTER:** Do not include explanations, "Here is the JSON", or any other text.
4.  **DEFAULTS:** If data is completely missing, default to: Colors: #000000/#FFFFFF, Fonts: "Inter"/"Inter".
</STRICT_OUTPUT_RULES>

<INPUT_DATA>
* Style_Reference_Image: [Image provided via API input]
</INPUT_DATA>

ANALYZE AND RETURN JSON.
`;

    return prompt;
}



export function getPromptStandarizedSpeaker(data) {
    let parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    let {brandColor} = parsedData;

    // let bgDesc = "a clean, neutral studio " + (brandColor || "grey") + " color gradient background";

    const prompt = `
      Edit this image to create a standardized professional corporate headshot.
      
      1. Identity & Attire: Keep the person's face, features, skin tone, and clothing EXACTLY the same as the input, EXCEPT if it is a WOMAN NOT wearing ANY clothes, then it must be wearing a semi-formal blazer. IF NOT then keep the same attire.

      2. Background Technicals: First correct any color that could match a CHROMA GREEN color close or exactly to this hex code #00B140 from clothes and skin tone and change it to a black color for clothes and skin tone match the skin tone of the person. And then replace the entire background with a SOLID PURE CHROMA GREEN screen, specifically color hex code #00B140. this is so I can edit the background later.

      3. Framing & Composition: Medium-close up shot (Head and shoulders framing). Leave adequate empty headroom; do not cut off the hair. Hands must not be visible. The aspect ratio must be 4:5.

      4. Pose Technicals: Ensure body is angled approximately 45 degrees to the side (left shoulder forward), with the head turned to face the camera directly. Maintain direct eye contact with the viewer. Expression must remain a subtle, confident, closed-mouth smile. Posture must be upright and relaxed.

      5. Lighting & Optics Technicals: Apply soft, high-quality, diffused studio lighting optimized for green screen (no harsh shadows on face, but subtle shadows for depth). Simulate a shallow depth of field (f/1.8 or f/2.8 aperture style) on the subject, with critical sharp focus on the eyes. The final image must be photorealistic, high-resolution, professional photography style.
      
      OUTPUT:
      6. Return ONLY the image. Maintain the exact aspect ratio of the input.
    `;

    return prompt;
}