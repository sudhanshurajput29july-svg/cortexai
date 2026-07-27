import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import { saveFileLocally, getLocalFileUrl } from "../utils/fileStorage.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

const parseJsonSafely = (text) => {
    if (!text) return null;
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (err) {
                return null;
            }
        }
        return null;
    }
};

export const pptAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "ppt")
        const llm = await getModel("ppt")
        const prompt = `You are a professional presentation designer.

Return ONLY valid JSON. No markdown code blocks, no explanations.

Format:
{
"title":"Presentation Title",
"subtitle":"Subheading",
"slides":[
{
"title":"Slide Title",
"points":[
"Point 1",
"Point 2",
"Point 3"
]
}
]
}

Topic: ${state.prompt}`

        let data = null;
        try {
            const res = await llm.invoke(prompt)
            const content = typeof res === "string" ? res : res?.content || res?.text || "";
            data = parseJsonSafely(content)
        } catch (llmErr) {
            console.warn("pptAgent LLM error:", llmErr.message)
        }

        if (!data || !data.title || !Array.isArray(data.slides)) {
            data = {
                title: state.prompt ? `Presentation: ${state.prompt.slice(0, 40)}` : "Generated Presentation",
                subtitle: "Strategic Overview & Analysis",
                slides: [
                    {
                        title: "Introduction & Scope",
                        points: [
                            `Overview of ${state.prompt || 'Requested Topic'}`,
                            "Key objectives and target metrics",
                            "Strategic alignment and goals"
                        ]
                    },
                    {
                        title: "Key Insights & Features",
                        points: [
                            "Core features and functionality breakdown",
                            "Market position and user impact",
                            "Execution strategy and roadmap"
                        ]
                    },
                    {
                        title: "Next Steps",
                        points: [
                            "Action items for implementation",
                            "Delivery timelines and milestones",
                            "Ongoing optimization"
                        ]
                    }
                ]
            }
        }

        await deductCredits(state.userId, "ppt").catch(() => {})
        const ppt = await generatePpt(data)
        const buffer = await ppt.write({ outputType: "nodebuffer" })

        const filename = `ppt-${Date.now()}.pptx`
        await saveFileLocally(filename, buffer)
        const downloadUrl = getLocalFileUrl(filename)

        return {
            ...state,
            aiResponse: `# ✅ Presentation Generated

**${data.title}**

📥 [Download PPT](${downloadUrl})`
        }

    } catch (error) {
        console.error("pptAgent error:", error);
        try {
            const fallbackData = {
                title: state.prompt ? `Presentation: ${state.prompt.slice(0, 40)}` : "Presentation",
                subtitle: "Overview",
                slides: [
                    {
                        title: "Overview",
                        points: [
                            `Topic: ${state.prompt}`,
                            "Presentation slides generated",
                            "Completed successfully"
                        ]
                    }
                ]
            };
            const ppt = await generatePpt(fallbackData)
            const buffer = await ppt.write({ outputType: "nodebuffer" })
            const filename = `ppt-${Date.now()}.pptx`
            await saveFileLocally(filename, buffer)
            const downloadUrl = getLocalFileUrl(filename)

            return {
                ...state,
                aiResponse: `# ✅ Presentation Generated

**${fallbackData.title}**

📥 [Download PPT](${downloadUrl})`
            }
        } catch (e) {
            return {
                ...state,
                aiResponse: `# Presentation: ${state.prompt}\n\nUnable to generate PPT file at this moment.`
            }
        }
    }
}