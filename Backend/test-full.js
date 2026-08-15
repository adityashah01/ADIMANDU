require('dotenv').config();
const prisma = require('./src/lib/prisma');
const Groq = require("groq-sdk");

async function test() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  // Step 1: Test Groq with the right prompt
  const systemPrompt = `You are a helpful AI assistant for a home services platform. 
You must ALWAYS output valid JSON in this format:
{"sufficient": boolean, "question": "...", "extracted": {"categorySlug": "plumbing|electrical|carpentry|painting|cleaning", "urgency": "High|Medium|Low", "serviceDetails": "..."}}`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "my kitchen sink is clogged and water is not draining" }
    ],
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
    temperature: 0.2
  });
  
  const text = response.choices[0]?.message?.content;
  console.log("AI response:", text);
  
  const aiData = JSON.parse(text);
  console.log("Parsed:", aiData);
  
  // Step 2: Test Prisma query
  const categorySlug = aiData.extracted?.categorySlug || 'plumbing';
  const category = await prisma.category.findFirst({ where: { slug: categorySlug.toLowerCase() } });
  console.log("Category found:", category?.name);
  
  await prisma.$disconnect();
}

test().catch(e => { console.error("FULL ERROR:", e); });
