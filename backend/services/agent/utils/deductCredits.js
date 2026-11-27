import axios from "axios"
import { internalHeaders } from "../../../shared/internalAuth.js"

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

export const checkCredits = async (userId, agent) => {
    const requiredCredits = COST[agent]

    if (!requiredCredits) {
        const error = new Error("unknown agent")
        error.status = 400
        error.data = { message: "unknown agent" }
        throw error
    }

    try {
        const { data } = await axios.get(
            `${process.env.AUTH_SERVICE}/internal/credits`,
            {
                params: { agent },
                headers: internalHeaders({ "x-user-id": userId }),
                timeout: 15000
            }
        )
        return data
    } catch (error) {
        if (error.response?.status === 402 || error.response?.status === 400 || error.response?.status === 404) {
            const err = new Error(error.response?.data?.message || "Not enough credits.")
            err.status = error.response.status
            err.data = error.response?.data || { message: err.message }
            throw err
        }

        throw error
    }
}

export const deductCredits = async (userId, agent) => {
    const { data } = await axios.post(
        `${process.env.AUTH_SERVICE}/internal/deduct-credits`,
        { agent },
        {
            headers: internalHeaders({ "x-user-id": userId }),
            timeout: 15000
        }
    )
    return data
}
