import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

const memoryKey = (userId, conversationId) =>
    `messages:${userId}:${conversationId}`

export const getMemory = async (userId, conversationId) => {
    const key = memoryKey(userId, conversationId)
    const cached = await redis.get(key)

    if (cached) {
        try {
            return JSON.parse(cached)
        } catch (error) {
            console.error("memory parse error", error)
            await redis.del(key)
            return []
        }
    }

    const messages = await getMessages(userId, conversationId)
    const safeMessages = Array.isArray(messages) ? messages : []

    await redis.set(key, JSON.stringify(safeMessages), "EX", 24 * 60 * 60)

    return safeMessages
}

export const addMessage = async (userId, conversationId, role, content) => {
    const key = memoryKey(userId, conversationId)
    const rawMessages = await redis.get(key)

    let messages = []

    if (rawMessages) {
        try {
            messages = JSON.parse(rawMessages)
        } catch (error) {
            console.error("memory parse error", error)
        }
    }

    if (!Array.isArray(messages)) {
        messages = []
    }

    messages.push({
        role,
        content
    })

    if (messages.length > 20) {
        messages.shift()
    }

    await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60)
}
