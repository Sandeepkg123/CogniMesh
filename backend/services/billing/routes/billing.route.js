import express from "express"
import { requireInternal, requireUser } from "../../../shared/internalAuth.js"
import { createOrder, verifyPayment } from "../controllers/billing.controller.js"

const router = express.Router()

router.use(requireInternal)

router.post("/create", requireUser, createOrder)
router.post("/verify", requireUser, verifyPayment)

export default router
