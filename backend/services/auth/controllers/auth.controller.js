import crypto from "node:crypto"
import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import Grant from "../models/grant.model.js"
import redis from "../../../shared/redis/redis.js"
import { PLANS } from "../../../shared/plans.js"

const SESSION_COOKIE = "session"
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

const COST = {
    chat: 1,
    search: 5,
    coding: 10,
    pdf: 10,
    ppt: 10,
    vision: 10,
    image: 10,
    pdfRag: 10,
    imageAnalyzer: 10
}

const sessionUser = (user) => ({
    userId: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    credits: user.credits,
    totalCredits: user.totalCredits,
    planExpiresAt: user.planExpiresAt
})

const refreshSession = async (user) => {
    const sessionId = await redis.get(`user-session-${user._id}`)
    if (!sessionId) {
        return
    }

    await redis.set(
        `session-${sessionId}`,
        JSON.stringify(sessionUser(user)),
        "EX",
        SESSION_TTL_SECONDS
    )
}

export const login = async (req, res) => {
    try {
        const { token } = req.body || {}

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "token is required" })
        }

        const decoded = await getAuth(app).verifyIdToken(token)

        let user = await User.findOne({ firebaseUid: decoded.uid })

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        // Invalidate the previous session for this user before issuing a new one.
        const oldSessionId = await redis.get(`user-session-${user._id}`)
        if (oldSessionId) {
            await redis.del(`session-${oldSessionId}`)
        }

        const sessionId = crypto.randomUUID()

        await redis.set(
            `user-session-${user._id}`,
            sessionId,
            "EX",
            SESSION_TTL_SECONDS
        )
        await redis.set(
            `session-${sessionId}`,
            JSON.stringify(sessionUser(user)),
            "EX",
            SESSION_TTL_SECONDS
        )

        res.cookie(SESSION_COOKIE, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_TTL_SECONDS * 1000
        })

        return res.status(200).json(user)
    } catch (error) {
        console.error("login error", error)
        return res.status(401).json({ message: "login failed" })
    }
}

export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.[SESSION_COOKIE]

        if (sessionId) {
            const rawSession = await redis.get(`session-${sessionId}`)

            if (rawSession) {
                try {
                    const session = JSON.parse(rawSession)
                    if (session?.userId) {
                        await redis.del(`user-session-${session.userId}`)
                    }
                } catch (error) {
                    console.error("logout session parse error", error)
                }
            }

            await redis.del(`session-${sessionId}`)
        }

        res.clearCookie(SESSION_COOKIE, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        })

        return res.status(200).json({ message: "logout successfully" })
    } catch (error) {
        console.error("logout error", error)
        return res.status(500).json({ message: "logout failed" })
    }
}

export const updateUserPayment = async (req, res) => {
    let grant = null
    let applied = false

    try {
        const { plan } = req.body || {}
        const planDefinition = PLANS[plan]

        // Only paid plans can be granted through the payment flow.
        if (!planDefinition || planDefinition.amount <= 0) {
            return res.status(400).json({ message: "invalid plan" })
        }

        const idempotencyKey = req.get("x-idempotency-key")
        if (!idempotencyKey) {
            return res.status(400).json({ message: "idempotency key is required" })
        }
        if (idempotencyKey.length > 200) {
            return res.status(400).json({ message: "invalid idempotency key" })
        }

        if (idempotencyKey) {
            const existingGrant = await Grant.findOne({ key: idempotencyKey })
            if (existingGrant) {
                if (
                    existingGrant.userId !== req.userId ||
                    existingGrant.plan !== planDefinition.id
                ) {
                    return res.status(409).json({ message: "idempotency key conflict" })
                }

                if (existingGrant.status === "completed") {
                    return res.status(200).json({ success: true, duplicate: true })
                }
                return res.status(409).json({ message: "payment already processing" })
            }

            try {
                grant = await Grant.create({
                    key: idempotencyKey,
                    userId: req.userId,
                    plan: planDefinition.id,
                    status: "processing"
                })
            } catch (error) {
                if (error.code === 11000) {
                    const existing = await Grant.findOne({ key: idempotencyKey })
                    if (
                        existing &&
                        (existing.userId !== req.userId ||
                            existing.plan !== planDefinition.id)
                    ) {
                        return res.status(409).json({ message: "idempotency key conflict" })
                    }
                    if (existing?.status === "completed") {
                        return res.status(200).json({ success: true, duplicate: true })
                    }
                    return res.status(409).json({ message: "payment already processing" })
                }
                throw error
            }
        }

        const planExpiresAt = new Date(
            Date.now() + planDefinition.validity * 24 * 60 * 60 * 1000
        )

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    plan: planDefinition.id,
                    planExpiresAt
                },
                $inc: {
                    credits: planDefinition.credits,
                    totalCredits: planDefinition.credits
                }
            },
            { new: true }
        )

        if (!user) {
            if (grant) {
                await Grant.deleteOne({ _id: grant._id, status: "processing" })
            }
            return res.status(404).json({ message: "user not found" })
        }

        applied = true

        if (grant) {
            grant.status = "completed"
            await grant.save()
        }

        await refreshSession(user).catch((error) => {
            console.error("session refresh failed", error.message)
        })

        return res.status(200).json({
            success: true,
            plan: user.plan,
            credits: user.credits
        })
    } catch (error) {
        if (grant && !applied) {
            await Grant.deleteOne({ _id: grant._id, status: "processing" }).catch(() => {})
        }

        console.error("update user payment error", error)
        return res.status(500).json({ message: "update plan failed" })
    }
}

export const creditCheck = async (req, res) => {
    try {
        const { agent } = req.query || {}
        const requiredCredits = COST[agent]

        if (!requiredCredits) {
            return res.status(400).json({ message: "unknown agent" })
        }

        const user = await User.findById(req.userId).select("credits")

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        if (user.credits < requiredCredits) {
            return res.status(402).json({ message: "Not enough credits." })
        }

        return res.status(200).json({
            success: true,
            credits: user.credits,
            requiredCredits
        })
    } catch (error) {
        console.error("credit check error", error)
        return res.status(500).json({ message: "credit check failed" })
    }
}

export const deductCredits = async (req, res) => {
    try {
        const { agent } = req.body || {}
        const requiredCredits = COST[agent]

        if (!requiredCredits) {
            return res.status(400).json({ message: "unknown agent" })
        }

        const user = await User.findOneAndUpdate(
            {
                _id: req.userId,
                credits: { $gte: requiredCredits }
            },
            {
                $inc: { credits: -requiredCredits }
            },
            { new: true }
        )

        if (!user) {
            const exists = await User.exists({ _id: req.userId })
            if (!exists) {
                return res.status(404).json({ message: "user not found" })
            }
            return res.status(402).json({ message: "Not enough credits." })
        }

        await refreshSession(user).catch((error) => {
            console.error("session refresh failed", error.message)
        })

        return res.status(200).json({
            success: true,
            credits: user.credits
        })
    } catch (error) {
        console.error("deduct credits error", error)
        return res.status(500).json({ message: "deduct credits failed" })
    }
}
