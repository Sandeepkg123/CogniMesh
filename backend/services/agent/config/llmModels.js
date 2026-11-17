import dotenv from "dotenv"
dotenv.config()
import { ChatOpenAI } from "@langchain/openai"

const env = (key, fallback) => process.env[key] || fallback

const MODELS = {
    chat: env("OMNIROUTER_CHAT_MODEL", "antigravity/gemini-3.5-flash-lite"),
    search: env("OMNIROUTER_SEARCH_MODEL", env("OMNIROUTER_CHAT_MODEL", "antigravity/gemini-3.5-flash-lite")),
    router: env("OMNIROUTER_ROUTER_MODEL", "antigravity/gemini-3.1-flash-lite"),
    intent: env("OMNIROUTER_INTENT_MODEL", "antigravity/gemini-3.1-flash-lite"),
    coding: env("OMNIROUTER_CODING_MODEL", "antigravity/claude-sonnet-4-6"),
    pdf: env("OMNIROUTER_PDF_MODEL", "antigravity/gemini-3.8-flash-high"),
    "pdf-rag": env("OMNIROUTER_PDF_RAG_MODEL", env("OMNIROUTER_PDF_MODEL", "antigravity/gemini-3.8-flash-high")),
    ppt: env("OMNIROUTER_PPT_MODEL", "antigravity/gemini-3.8-flash-high"),
    image: env("OMNIROUTER_VISION_MODEL", "antigravity/gemini-3.8-flash-high"),
    imageAnalyzer: env("OMNIROUTER_VISION_MODEL", "antigravity/gemini-3.8-flash-high")
}

const MODEL_OPTIONS = {
    router: { temperature: 0 },
    intent: { temperature: 0 },
    coding: { temperature: 0, maxTokens: 2500 }
}

const clients = new Map()

export const getModel = async (agent) => {
    const key = MODELS[agent] ? agent : "chat"

    if (clients.has(key)) {
        return clients.get(key)
    }

    const apiKey = process.env.OMNIROUTER_API_KEY
    const baseURL = process.env.OMNIROUTER_BASE_URL

    if (!apiKey) {
        throw new Error("OMNIROUTER_API_KEY is missing. Add it to backend/services/agent/.env")
    }

    if (!baseURL) {
        throw new Error("OMNIROUTER_BASE_URL is missing. Add your cloud endpoint (ending in /v1) to backend/services/agent/.env")
    }

    const client = new ChatOpenAI({
        model: MODELS[key],
        apiKey,
        configuration: { baseURL },
        ...MODEL_OPTIONS[key]
    })

    clients.set(key, client)
    return client
}
