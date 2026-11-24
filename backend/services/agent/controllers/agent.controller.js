import axios from "axios"
import fs from "node:fs/promises"
import mongoose from "mongoose"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import { internalHeaders } from "../../../shared/internalAuth.js"
import { hasValidFileSignature } from "../utils/fileSignature.js"

const ALLOWED_AGENTS = new Set([
    "auto",
    "chat",
    "search",
    "coding",
    "pdf",
    "ppt",
    "vision",
    "pdfRag",
    "imageAnalyzer"
])

const FILE_AGENTS = new Set(["pdfRag", "imageAnalyzer"])

const verifyConversation = async (userId, conversationId) => {
    await axios.get(
        `${process.env.CHAT_SERVICE}/internal/conversations/${conversationId}/verify`,
        {
            headers: internalHeaders({ "x-user-id": userId }),
            timeout: 15000
        }
    )
}

const saveMessage = async (userId, payload) => {
    await axios.post(
        `${process.env.CHAT_SERVICE}/internal/save-message`,
        payload,
        {
            headers: internalHeaders({ "x-user-id": userId }),
            timeout: 15000
        }
    )
}

export const agent = async (req, res, next) => {
    try {
        const userId = req.userId
        const { prompt, conversationId, agent: requestedAgent } = req.body || {}
        const file = req.file
        const selectedAgent = requestedAgent || "auto"

        if (!ALLOWED_AGENTS.has(selectedAgent)) {
            return res.status(400).json({ message: "invalid agent" })
        }

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({ message: "invalid conversation id" })
        }

        if (prompt !== undefined && typeof prompt !== "string") {
            return res.status(400).json({ message: "invalid prompt" })
        }

        const promptText = (prompt || "").trim()

        if (promptText.length > 20000) {
            return res.status(400).json({ message: "prompt is too long" })
        }

        if (!promptText && !file) {
            return res.status(400).json({ message: "prompt or file is required" })
        }

        if (FILE_AGENTS.has(selectedAgent) && !file) {
            return res.status(400).json({ message: "file is required for this agent" })
        }

        if (file && selectedAgent === "pdfRag" && file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "pdfRag requires a PDF file" })
        }

        if (file && selectedAgent === "imageAnalyzer" && !file.mimetype.startsWith("image/")) {
            return res.status(400).json({ message: "imageAnalyzer requires an image file" })
        }

        if (file) {
            const validSignature = await hasValidFileSignature(file.path, file.mimetype)

            if (!validSignature) {
                return res.status(400).json({ message: "invalid file content" })
            }
        }

        await verifyConversation(userId, conversationId)

        await saveMessage(userId, {
            conversationId,
            role: "user",
            content: promptText
        })

        const result = await graph.invoke({
            prompt: promptText,
            conversationId,
            agent: selectedAgent,
            userId,
            file
        })

        const answer = typeof result?.aiResponse === "string"
            ? result.aiResponse
            : String(result?.aiResponse ?? "")

        const images = Array.isArray(result?.images)
            ? result.images
                .filter((image) => typeof image === "string")
                .slice(0, 10)
            : undefined

        const artifacts = Array.isArray(result?.artifacts)
            ? result.artifacts
            : undefined

        await addMessage(userId, conversationId, "user", promptText).catch((error) => {
            console.error("failed to update chat memory", error.message)
        })
        await addMessage(userId, conversationId, "assistant", answer).catch((error) => {
            console.error("failed to update chat memory", error.message)
        })

        await saveMessage(userId, {
            conversationId,
            role: "assistant",
            content: answer,
            images,
            artifacts
        })

        return res.status(200).json({
            answer,
            images,
            artifacts
        })
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ message: "conversation not found" })
        }

        next(error)
    } finally {
        if (req.file?.path) {
            await fs.rm(req.file.path, { force: true }).catch(() => {})
        }
    }
}
