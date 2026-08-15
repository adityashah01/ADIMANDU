require('dotenv').config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function test() {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You must ALWAYS output valid JSON. {\"sufficient\": true}" },
        { role: "user", content: "my tap is leaking" }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    console.log(response.choices[0].message.content);
  } catch (e) {
    console.error(e);
  }
}
test();
