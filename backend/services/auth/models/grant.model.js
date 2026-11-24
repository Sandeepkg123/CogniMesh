import mongoose from "mongoose"

const grantSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    plan: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["processing", "completed"],
        default: "processing"
    }
}, {
    timestamps: true
})

const Grant = mongoose.model("Grant", grantSchema)

export default Grant
