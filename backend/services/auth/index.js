import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/auth.route.js"
import internalRouter from "./routes/internal.route.js"
import cookieParser from "cookie-parser"
import { requireInternal } from "../../shared/internalAuth.js"

const port = process.env.PORT

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error("INTERNAL_SERVICE_TOKEN is required")
    process.exit(1)
}

const app = express()
app.disable("x-powered-by")
app.set("trust proxy", 1)
app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "hello from auth" })
})
app.use("/internal", internalRouter)
app.use("/", requireInternal, router)

app.listen(port, () => {
    console.log(`auth started at ${port}`)
    connectDb()
})
