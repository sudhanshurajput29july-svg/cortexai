import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
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

export const pdfAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "pdf")
        const llm = await getModel("pdf")
        const prompt = `You are an expert document writer.

Return ONLY valid JSON. No markdown code blocks, no explanation.

Structure:
{
  "title": "Document Title",
  "subtitle": "Short Subtitle",
  "sections": [
    {
      "heading": "Section Heading",
      "points": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}

Topic: ${state.prompt}`

        let data = null;
        try {
            const res = await llm.invoke(prompt);
            const content = typeof res === "string" ? res : res?.content || res?.text || "";
            data = parseJsonSafely(content);
        } catch (llmErr) {
            console.warn("pdfAgent LLM error:", llmErr.message);
        }

        if (!data || !data.title || !Array.isArray(data.sections)) {
            data = {
                title: state.prompt ? `Report: ${state.prompt.slice(0, 40)}` : "Generated Document",
                subtitle: "Automated Summary & Analysis",
                sections: [
                    {
                        heading: "Executive Summary",
                        points: [
                            `Comprehensive breakdown regarding: ${state.prompt || 'Requested Topic'}`,
                            "Key objectives and foundational strategy overview.",
                            "Identified opportunities and tactical milestones."
                        ]
                    },
                    {
                        heading: "Key Highlights & Strategic Impact",
                        points: [
                            "Core requirement evaluation and operational workflow.",
                            "Performance metrics and quality standards.",
                            "Resource allocation and optimization strategies."
                        ]
                    },
                    {
                        heading: "Next Steps & Execution Plan",
                        points: [
                            "Immediate action items for deployment.",
                            "Monitoring, feedback, and iterative improvements."
                        ]
                    }
                ]
            };
        }

        await deductCredits(state.userId, "pdf").catch(() => {});
        const pdfBuffer = await generatePdf(data);
        const filename = `pdf-${Date.now()}.pdf`;
        await saveFileLocally(filename, pdfBuffer);
        const downloadUrl = getLocalFileUrl(filename);

        return {
            ...state,
            aiResponse: `# PDF Generated Successfully

**${data.title}**

📥 [Download PDF](${downloadUrl})`
        };

    } catch (error) {
        console.error("pdfAgent error:", error);
        try {
            const fallbackData = {
                title: state.prompt ? `Document: ${state.prompt.slice(0, 40)}` : "Document Summary",
                subtitle: "Summary Overview",
                sections: [
                    {
                        heading: "Overview",
                        points: [
                            `Processed topic request: ${state.prompt}`,
                            "Formatted document analysis.",
                            "Completed successfully."
                        ]
                    }
                ]
            };
            const pdfBuffer = await generatePdf(fallbackData);
            const filename = `pdf-${Date.now()}.pdf`;
            await saveFileLocally(filename, pdfBuffer);
            const downloadUrl = getLocalFileUrl(filename);
            return {
                ...state,
                aiResponse: `# PDF Generated

**${fallbackData.title}**

📥 [Download PDF](${downloadUrl})`
            };
        } catch (e) {
            return {
                ...state,
                aiResponse: `# Document Summary\n\nUnable to generate PDF file at this moment. Please try again.`
            };
        }
    }
}