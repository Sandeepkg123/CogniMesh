import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/billing.route.js"

const port = process.env.PORT

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error("INTERNAL_SERVICE_TOKEN is required")
    process.exit(1)
}

const app = express()
app.disable("x-powered-by")
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "hello from billing" })
})
app.use("/", router)

app.listen(port, () => {
    console.log(`billing started at ${port}`)
    connectDb()
})
