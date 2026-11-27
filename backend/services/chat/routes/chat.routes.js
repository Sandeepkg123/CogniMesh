import express from "express"
import { requireInternal, requireUser } from "../../../shared/internalAuth.js"
import {
    createConversation,
    deleteConversation,
    getConversations,
    getMessages,
    updateConversation
} from "../controllers/chat.controller.js"

const router = express.Router()

router.use(requireInternal)

router.post("/create-conversation", requireUser, createConversation)
router.get("/get-conversations", requireUser, getConversations)
router.post("/update-conversation", requireUser, updateConversation)
router.delete("/delete-conversation/:id", requireUser, deleteConversation)
router.get("/get-messages/:conversationId", requireUser, getMessages)

export default router
