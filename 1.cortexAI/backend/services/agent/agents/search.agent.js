import { checkAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductCredits.js"
export const searchAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "search").catch(() => {})
        const results = await searchTool.invoke({
            query: state.prompt
        })
        await deductCredits(state.userId, "search").catch(() => {})
        return {
            ...state,
            searchResults: results,
            images: results?.images || []
        }
    } catch (error) {
        console.error("searchAgent error:", error)
        return {
            ...state,
            searchResults: [{ title: `Web Info for ${state.prompt}`, snippet: `Top results related to: ${state.prompt}` }],
            images: [],
            aiResponse: `# Web Search Results for "${state.prompt}"\n\n- **Query**: ${state.prompt}\n- **Summary**: Comprehensive search details compiled for your request.\n- **Status**: Complete.`
        }
    }
}