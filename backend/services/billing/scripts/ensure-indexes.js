import "dotenv/config"
import mongoose from "mongoose"
import Payment from "../models/payment.model.js"

const run = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    await Payment.syncIndexes()
    console.log("payment indexes synced")
    await mongoose.disconnect()
}

run().catch((error) => {
    console.error("failed to sync payment indexes", error)
    process.exit(1)
})
