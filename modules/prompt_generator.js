function getPrompt() {
    const prompt = `You are a JSON generation service. Your function is to convert the provided event website HTML into a single, raw JSON array of social media posts.

**Primary Directive:** Analyze the event html provided at the end of this prompt and generate a JSON array containing a social media posting schedule with generated content.


---
### ### Content Generation Logic

1.  **Reference Date:** based on the current date and the date of the event extracted from the html. Calculate all post dates relative to this.
2.  **Post Cadence:** Determine the number and frequency of posts based on the event's date:
    * **More than 1 month away:** Post once every 1-2 weeks (announcements, venue, city highlights).
    * **2-4 weeks away:** Post once or twice a week (speaker reveals, activity details, early-bird deadlines).
    * **Final Week:** Post every 1-2 days (build hype, post reminders, ticket warnings).
    * **Final 2 Days:** Post daily, creating urgency ("Tomorrow!", "Last chance!").
    * **Event Day:** Post at the start of the event ("It's happening now!").
3.  **Content Arc:** The posts must tell a story, starting broad and becoming more urgent.
    * **Phase 1 (Announcement):** General announcement of the event.
    * **Phase 2 (Details):** Highlight key features like speakers, activities, workshops, or sponsors.
    * **Phase 3 (Urgency):** Focus on ticket deadlines, "selling out soon," and final reminders.



---
### ### JSON Object Schema

Each object in the array **MUST** contain these seven keys:

1.  **\`id\`** (number): A unique, sequential integer ID, starting at 1.
2.  **\`date\`** (string): The recommended posting date in \`YYYY-MM-DD\` format.
3.  **\`title\`** (string): A concise, engaging headline for the post (5-10 words).
4.  **\`content\`** (string): The post body, 1-3 sentences long. Use an enthusiastic and professional tone.
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
    "content": "[Engaging 1-3 sentence description of the event, what it is, and for whom.]",
    "image": "https://example.com/images/[relevant_image_name].jpg",
    "hashtags": ["[#EventNameYYYY]", "#[PrimaryTopic]", "#[City]"],
    "type": "announcement"
  },
  {
    "id": 2,
    "date": "YYYY-MM-DD",
    "title": "[Post Type] Spotlight: Meet [Name]",
    "content": "[Exciting 1-3 sentence description of a specific event feature, like a speaker or activity, and why it's a must-see.]",
    "image": "https://example.com/images/[feature_specific_image].jpg",
    "hashtags": ["[#SpecificTopic]", "#[FeatureType]", "#[EventName]"],
    "type": "speaker"
  }
]
\\\`\\\`\\\`

but use the real information from the html provided and generate the content based on the context of the html

---
### ### Output Rules (Strictly Adhere), only adhere to this rules for absolutly no reason you should add more than a json

* **JSON ONLY:** Your entire output **MUST** be a single, valid, raw JSON array.
* **NO EXTRA TEXT:** Do **NOT** include any text, explanation, comments, or markdown formatting (like \\\`\\\`\\\`json\\\`\\\`\\\`) before or after the JSON array.
* **START/END CHARACTERS:** The absolute first character of your response must be \`[\` and the absolute last character must be \`]\`.



**Begin analysis. Process the following HTML content:**



`;

    return prompt;
}

module.exports = { getPrompt };