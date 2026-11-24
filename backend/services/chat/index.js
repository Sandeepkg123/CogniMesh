import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/chat.routes.js"
import internalRouter from "./routes/chat.internal.routes.js"

const port = process.env.PORT

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error("INTERNAL_SERVICE_TOKEN is required")
    process.exit(1)
}

const app = express()
app.disable("x-powered-by")
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "hello from chat" })
})
app.use("/internal", internalRouter)
app.use("/", router)

app.listen(port, () => {
    console.log(`chat started at ${port}`)
    connectDb()
})
