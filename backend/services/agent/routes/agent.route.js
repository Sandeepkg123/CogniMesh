import express from "express"
import { requireInternal, requireUser } from "../../../shared/internalAuth.js"
import { agent } from "../controllers/agent.controller.js"
import multer from "../config/multer.js"

const router = express.Router()

router.post(
    "/chat",
    requireInternal,
    requireUser,
    multer.single("file"),
    agent
)

export default router
