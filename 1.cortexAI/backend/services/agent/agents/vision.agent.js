import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { saveFileLocally, getLocalFileUrl } from "../utils/fileStorage.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const visionAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "image")
        const llm = await getModel("image")
        const res = await llm.invoke(`
        You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:
${state.prompt}
        `)

        const prompt = res.content.trim()
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

        const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" })
        await deductCredits(state.userId, "vision")
        const buffer = Buffer.from(imageRes.data)
        const filename = `image-${Date.now()}.png`

        await saveFileLocally(filename, buffer)
        const downloadUrl = getLocalFileUrl(filename)

        return {
            ...state,
            aiResponse: `
![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})`
        }
    } catch (error) {
        console.error("visionAgent error:", error);
        const fallbackImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(state.prompt || "futuristic AI art")}`;
        return {
            ...state,
            aiResponse: `# Image Generated for "${state.prompt}"\n\n![Generated Image](${fallbackImgUrl})\n\n[Open Full Image](${fallbackImgUrl})`
        }
    }
}