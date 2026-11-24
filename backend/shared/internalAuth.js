import crypto from "node:crypto"

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

export const requireInternal = (req, res, next) => {
    const expected = process.env.INTERNAL_SERVICE_TOKEN || ""
    const provided = req.get("x-internal-token") || ""

    if (!expected) {
        console.error("INTERNAL_SERVICE_TOKEN is not configured")
        return res.status(500).json({ message: "server misconfigured" })
    }

    if (provided.length !== expected.length) {
        return res.status(401).json({ message: "unauthorized" })
    }

    const valid = crypto.timingSafeEqual(
        Buffer.from(provided),
        Buffer.from(expected)
    )

    if (!valid) {
        return res.status(401).json({ message: "unauthorized" })
    }

    next()
}

export const requireUser = (req, res, next) => {
    const userId = req.get("x-user-id") || ""

    if (!OBJECT_ID_RE.test(userId)) {
        return res.status(401).json({ message: "unauthorized" })
    }

    req.userId = userId
    next()
}

export const internalHeaders = (extra = {}) => ({
    "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
    ...extra
})
