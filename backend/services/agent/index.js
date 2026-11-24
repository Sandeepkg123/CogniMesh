import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"

const port = process.env.PORT

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error("INTERNAL_SERVICE_TOKEN is required")
    process.exit(1)
}

const app = express()
app.disable("x-powered-by")

app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "hello from agent" })
})
app.use("/", router)

app.use((err, req, res, next) => {
    console.error("agent error", err.message)

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "file too large" })
    }

    if (err.status) {
        return res.status(err.status).json(
            err.data || { message: err.message || "request failed" }
        )
    }

    return res.status(500).json({ message: "agent error" })
})

app.listen(port, () => {
    console.log(`agent started at ${port}`)
    connectDb()
})
