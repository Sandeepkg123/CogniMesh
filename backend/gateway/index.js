import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"

const port = process.env.PORT

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error("INTERNAL_SERVICE_TOKEN is required")
    process.exit(1)
}

const app = express()
app.disable("x-powered-by")
app.set("trust proxy", 1)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(morgan("dev"))
app.use(cookieParser())

const PUBLIC_AUTH_PATHS = new Set(["/login", "/logout"])

const allowPublicAuthOnly = (req, res, next) => {
    const path = (req.originalUrl || req.url)
        .split("?")[0]
        .replace(/^\/api\/auth/, "")
        .replace(/\/+$/, "") || "/"

    if (!PUBLIC_AUTH_PATHS.has(path)) {
        return res.sendStatus(404)
    }
    next()
}

const blockInternalPaths = (req, res, next) => {
    const rawPath = (req.originalUrl || req.url).split("?")[0]

    let path
    try {
        path = decodeURIComponent(rawPath)
    } catch {
        path = rawPath
    }

    path = path.replace(/^\/api\/(chat|agent|billing)/, "")

    const segments = path
        .split(/[\\/]+/)
        .filter(Boolean)
        .map((segment) => segment.toLowerCase())

    // `save-message` used to be public on the chat service. Block it at the
    // gateway so the legacy route cannot be abused while services roll over.
    if (segments.includes("internal") || segments[0] === "save-message") {
        return res.sendStatus(404)
    }

    next()
}

app.use(
    "/api/auth",
    allowPublicAuthOnly,
    proxyWithHeader(process.env.AUTH_SERVICE)
)
app.use("/api/chat", blockInternalPaths, protect, proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent", blockInternalPaths, protect, proxyWithHeader(process.env.AGENT_SERVICE))
app.use("/api/billing", blockInternalPaths, protect, proxyWithHeader(process.env.BILLING_SERVICE))
app.get("/api/me", protect, getCurrentUser)
app.get("/", (req, res) => {
    res.json({ message: "hello from gateway v5" })
})

app.listen(port, () => {
    console.log(`gateway started at ${port}`)
})
