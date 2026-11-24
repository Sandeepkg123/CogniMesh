import "dotenv/config"
import mongoose from "mongoose"
import Grant from "../models/grant.model.js"

const run = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    await Grant.syncIndexes()
    console.log("grant indexes synced")
    await mongoose.disconnect()
}

run().catch((error) => {
    console.error("failed to sync grant indexes", error)
    process.exit(1)
})
