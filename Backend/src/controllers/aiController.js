const { GoogleGenAI } = require("@google/genai");
const prisma = require("../lib/prisma");
const { calculateDistance } = require("../utils/distance");

let ai = null;

async function processAiRequest(req, res) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Sewa AI is currently unavailable (Missing API Key)." });
        }
        
        if (!ai) {
            ai = new GoogleGenAI({ 
                apiKey: process.env.GEMINI_API_KEY,
                httpOptions: {
                    headers: {
                        'User-Agent': 'aistudio-build',
                    }
                }
            });
        }

        const { messages, userLocation } = req.body;
        
        const systemPrompt = `You are a helpful AI assistant for a home services booking platform called "Sewa Center".
Your goal is to understand the customer's problem and either:
1. Ask follow-up questions to gather more details (max 2 questions total).
2. If enough info is gathered (e.g. they described what needs fixing, urgency, category), return a JSON object with the extracted details and recommend providers.

You must ALWAYS output valid JSON.
Format of JSON:
{
  "sufficient": boolean, 
  "question": "Ask a clarifying question if sufficient is false",
  "extracted": {
    "categorySlug": "plumbing|electrical|carpentry|painting|cleaning|appliance|tutoring|mechanic (guess best fit)",
    "urgency": "High|Medium|Low",
    "serviceDetails": "Summarized details of the task"
  }
}
If the customer provides enough info (like "my pipe is leaking very badly"), sufficient is true.
If the customer just says "I need help", sufficient is false and ask what kind of help.
`;

        const chatHistory = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        let aiData;
        try {
            let response;
            let retries = 3;
            while (retries > 0) {
                try {
                    response = await ai.models.generateContent({
                        model: "gemini-3.7-flash",
                        contents: [
                            ...chatHistory,
                            { role: 'user', parts: [{ text: messages[messages.length - 1].content }] }
                        ],
                        config: {
                            systemInstruction: systemPrompt,
                            responseMimeType: "application/json"
                        }
                    });
                    break;
                } catch (err) {
                    const isRetryable = err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('UNAVAILABLE') || err.message?.includes('resource_exhausted');
                    if (isRetryable && retries > 1) {
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Exponential backoff
                        continue;
                    }
                    throw err;
                }
            }

            aiData = JSON.parse(response.text);
        } catch (apiErr) {
            // Intelligent fallback heuristic when AI quota/rate limit is hit
            const lastMsg = messages[messages.length - 1].content.toLowerCase();
            let matchedCategory = "plumbing";
            if (lastMsg.includes("electric") || lastMsg.includes("wire") || lastMsg.includes("light") || lastMsg.includes("switch") || lastMsg.includes("fan")) matchedCategory = "electrical";
            else if (lastMsg.includes("paint") || lastMsg.includes("wall")) matchedCategory = "painting";
            else if (lastMsg.includes("clean") || lastMsg.includes("dust") || lastMsg.includes("floor")) matchedCategory = "cleaning";
            else if (lastMsg.includes("wood") || lastMsg.includes("door") || lastMsg.includes("carpenter") || lastMsg.includes("table")) matchedCategory = "carpentry";
            else if (lastMsg.includes("ac") || lastMsg.includes("fridge") || lastMsg.includes("washing") || lastMsg.includes("appliance")) matchedCategory = "appliance";
            else if (lastMsg.includes("tutor") || lastMsg.includes("teach") || lastMsg.includes("math")) matchedCategory = "tutoring";
            else if (lastMsg.includes("bike") || lastMsg.includes("car") || lastMsg.includes("mechanic") || lastMsg.includes("vehicle")) matchedCategory = "mechanic";

            aiData = {
                sufficient: true,
                extracted: {
                    categorySlug: matchedCategory,
                    urgency: "Medium",
                    serviceDetails: messages[messages.length - 1].content
                }
            };
        }

        if (!aiData.sufficient) {
            return res.json({ sufficient: false, message: aiData.question });
        }

        const { categorySlug, urgency, serviceDetails } = aiData.extracted;

        let normalizedSlug = (categorySlug || '').toLowerCase().trim();
        if (normalizedSlug === 'appliance' || normalizedSlug === 'appliances') normalizedSlug = 'appliance-repair';
        if (normalizedSlug === 'mechanic' || normalizedSlug === 'vehicle') normalizedSlug = 'vehicle-mechanic';

        const category = await prisma.category.findFirst({
            where: {
                OR: [
                    { slug: normalizedSlug },
                    { slug: categorySlug.toLowerCase() },
                    { slug: { contains: normalizedSlug } },
                    { name: { contains: categorySlug, mode: 'insensitive' } }
                ]
            }
        });

        let providers = [];
        if (category) {
            const availableProviders = await prisma.providerProfile.findMany({
                where: {
                    categoryId: category.id,
                    user: { status: "ACTIVE" }
                },
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                    category: { select: { name: true, slug: true } }
                }
            });

            const queryText = `${serviceDetails || ''} ${messages[messages.length - 1]?.content || ''}`.toLowerCase();

            providers = availableProviders.map(p => {
                let distance = null;
                if (userLocation && p.latitude && p.longitude) {
                    distance = calculateDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
                }

                // 1. Base score from rating and review volume
                const rating = Number(p.averageRating || 0);
                const reviews = Number(p.reviewCount || 0);
                let score = (rating * 12) + Math.min(reviews, 50);

                // 2. Verified & Available boosts
                if (p.verified) score += 15;
                if (p.isAvailable) score += 10;

                // 3. Proximity score boost based on distance in km
                if (distance !== null) {
                    if (distance < 2) score += 45;
                    else if (distance < 5) score += 30;
                    else if (distance < 10) score += 18;
                    else if (distance < 20) score += 8;
                    else if (distance > 35) score -= 20;
                }

                // 4. Skills & specialization relevance boost
                if (p.skills && Array.isArray(p.skills) && p.skills.length > 0) {
                    let skillMatches = 0;
                    for (const skill of p.skills) {
                        const skillLower = skill.toLowerCase();
                        const words = skillLower.split(/\s+/).filter(w => w.length > 3);
                        const isMatch = skillLower.includes(queryText) || queryText.includes(skillLower) ||
                            words.some(w => queryText.includes(w));
                        if (isMatch) skillMatches++;
                    }
                    score += Math.min(skillMatches * 8, 24);
                }

                return { ...p, score: Math.round(score), distance };
            }).sort((a, b) => b.score - a.score).slice(0, 10);
        }

        res.json({
            sufficient: true,
            extracted: aiData.extracted,
            providers,
            category: category ? category.name : categorySlug
        });

    } catch (error) {
        console.error("AI processing error message:", error.message);
        res.status(500).json({ error: error.message || "Failed to process AI request" });
    }
}

module.exports = { processAiRequest };
