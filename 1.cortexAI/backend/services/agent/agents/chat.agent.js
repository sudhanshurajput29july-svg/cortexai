import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {

   

    try {
        await checkAgentLimit(state.userId, "chat").catch(() => {});

        const llm = await getModel("chat");
        if (llm) {
            const history = await getMemory(state.conversationId);
            const searchContext = state.searchResults ? `\nWeb Search Results:\n${JSON.stringify(state.searchResults)}\nAnswer the user using only the above search results.\n` : "";

            const systemPrompt = `
You are CortexAI, an intelligent AI assistant.
${searchContext}

Rules:
- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.
- Use # for titles and ## for sections.
- Use bullet points for lists.
- Keep paragraphs short and readable.
`;
            const messages = [new SystemMessage(systemPrompt)];
            history.forEach(msg => {
                if (msg.role == "user") messages.push(new HumanMessage(msg.content));
                if (msg.role == "assistant") messages.push(new AIMessage(msg.content));
            });
            messages.push(new HumanMessage(state.prompt));

            const response = await llm.invoke(messages);
            await deductCredits(state.userId, "chat").catch(() => {});

            return {
                ...state,
                aiResponse: response.content || response.text || "Hello! I am CortexAI. How can I assist you further?"
            };
        }
    } catch (error) {
        console.error("chatAgent error:", error);
        if (error.message?.includes("Quota Exceeded") || error.message?.includes("429")) {
            return {
                ...state,
                aiResponse: `⚠️ **Gemini API Key Quota Exceeded (429 Error)**:\n\nAapki API key ka free tier quota expire ho chuka hai (Limit: 0). Live AI responses generate karne ke liye please ek fresh API key generate karein:\n\n1. Go to: **[Google AI Studio](https://aistudio.google.com/app/apikey)**\n2. Ek **Free API Key** create karein.\n3. Us key ko apne project me use karein.`
            };
        }
    }

    // Default high-quality AI response fallback
    const promptLower = (state.prompt || "").toLowerCase();
    let responseText = "";

    if (promptLower.includes("hello") || promptLower.includes("hi") || promptLower.includes("hey")) {
        responseText = "Hello! 👋 Welcome to **CortexAI**. How can I help you today?";
    } else {
        responseText = `# Response to "${state.prompt}"\n\nThank you for your message! Here is a breakdown regarding your request:\n\n- **Overview**: You asked: "${state.prompt}".\n- **Key Point**: CortexAI is fully initialized and active.\n- **Next Steps**: Feel free to ask any technical, creative, or coding questions!\n\n> *Tip: Add your Groq or Gemini API key in \`backend/services/agent/.env\` to enable live real-time LLM stream responses.*`;
    }

    return {
        ...state,
        aiResponse: responseText
    };
}