import dotenv from "dotenv"
dotenv.config()
import { GoogleGenerativeAI } from "@google/generative-ai"
import { ChatGroq } from "@langchain/groq"
import { ChatOpenRouter } from "@langchain/openrouter"

const googleKey = process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes("add your") ? process.env.GOOGLE_API_KEY : null;
const groqKey = process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("add your") ? process.env.GROQ_API_KEY : null;
const openrouterKey = process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes("add your") ? process.env.OPENROUTER_API_KEY : null;

const groq = groqKey ? new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: groqKey
}) : null;

const openrouter = openrouterKey ? new ChatOpenRouter({
    model: "deepseek/deepseek-chat",
    apiKey: openrouterKey,
    temperature: 0,
    maxTokens: 2500
}) : null;

let geminiClient = null;
if (googleKey) {
    try {
        const genAI = new GoogleGenerativeAI(googleKey);
        geminiClient = {
            async invoke(messages) {
                let promptText = "";
                if (typeof messages === "string") {
                    promptText = messages;
                } else if (Array.isArray(messages)) {
                    promptText = messages.map(m => m.content || m.text || "").filter(Boolean).join("\n");
                } else {
                    promptText = String(messages);
                }
                
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                    const result = await model.generateContent(promptText);
                    const text = result.response.text();
                    return { content: text, text };
                } catch (err) {
                    console.warn("Gemini API warning/error:", err.message);
                    if (groq) {
                        console.log("Falling back to Groq model...");
                        return await groq.invoke(messages);
                    }
                    if (openrouter) {
                        console.log("Falling back to OpenRouter model...");
                        return await openrouter.invoke(messages);
                    }
                    if (err.message?.includes("429") || err.message?.includes("Quota exceeded") || err.message?.includes("RESOURCE_EXHAUSTED")) {
                        throw new Error("Gemini API Key Quota Exceeded (429). Please generate a new key at https://aistudio.google.com/app/apikey");
                    }
                    throw err;
                }
            }
        };
    } catch (e) {
        console.error("Gemini client init error:", e);
    }
}

export const getModel = async (agent) => {
    switch (agent) {
        case "chat":
            return geminiClient || groq || openrouter;
        case "search":
            return geminiClient || groq || openrouter;
        case "coding":
            return geminiClient || openrouter || groq;
        case "imageAnalyzer":
            return geminiClient || openrouter || groq;
        default:
            return geminiClient || groq || openrouter;
    }
}
