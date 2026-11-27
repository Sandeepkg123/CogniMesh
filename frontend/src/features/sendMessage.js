
import api from '../../utils/axios'

async function sendMessage(payload, options = {}) {
 try {
    const {data}=await api.post("/api/agent/chat",payload,{
      signal: options.signal
    })
    return data
 } catch (error) {
    if (error.code === "ERR_CANCELED") {
      return null
    }

    console.error(error)
    return { error }
 }
}

export default sendMessage
