import axios from "axios"
import { internalHeaders } from "../../../shared/internalAuth.js"

export const deductCredits = async (userId, agent) => {
    try {
        const { data } = await axios.post(
            `${process.env.AUTH_SERVICE}/internal/deduct-credits`,
            { agent },
            {
                headers: internalHeaders({ "x-user-id": userId }),
                timeout: 15000
            }
        )
        return data
    } catch (error) {
        console.error("deduct credits error", error.message)
        return null
    }
}
