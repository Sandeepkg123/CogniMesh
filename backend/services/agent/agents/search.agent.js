import { checkAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { checkCredits, deductCredits } from "../utils/deductCredits.js"
export const searchAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "search")
        await checkCredits(state.userId, "search")
        const results = await searchTool.invoke({
            query: state.prompt
        })
        await deductCredits(state.userId, "search")
        console.log(results)
        return {
            ...state,
            searchResults: results,
            images: results.images
        }
    } catch (error) {
        console.log(error)
        return {
            ...state,
            searchResults: [],
            images: [],
            aiResponse: error?.data?.message || "failed to search",
            failed: true,
            agent: "search"
        }
    }
}