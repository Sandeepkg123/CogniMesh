import axios from "axios"
import { internalHeaders } from "../../../shared/internalAuth.js"

export const getMessages = async (userId, conversationId) => {
    try {
        const { data } = await axios.get(
            `${process.env.CHAT_SERVICE}/get-messages/${conversationId}`,
            {
                headers: internalHeaders({ "x-user-id": userId }),
                timeout: 15000
            }
        )
        return data
    } catch (error) {
        console.error("get messages error", error.message)
        return []
    }
}
