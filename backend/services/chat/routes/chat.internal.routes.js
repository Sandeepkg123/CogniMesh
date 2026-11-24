import express from "express"
import { requireInternal, requireUser } from "../../../shared/internalAuth.js"
import { saveMessage, verifyConversation } from "../controllers/chat.controller.js"

const router = express.Router()

router.use(requireInternal)

router.post("/save-message", requireUser, saveMessage)
router.get("/conversations/:conversationId/verify", requireUser, verifyConversation)

export default router
