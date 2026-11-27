import express from "express"
import { requireInternal, requireUser } from "../../../shared/internalAuth.js"
import { creditCheck, deductCredits, updateUserPayment } from "../controllers/auth.controller.js"

const router = express.Router()

router.use(requireInternal)

router.post("/update-plan", requireUser, updateUserPayment)
router.post("/deduct-credits", requireUser, deductCredits)
router.get("/credits", requireUser, creditCheck)

export default router
