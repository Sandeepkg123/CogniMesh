import api from "../../utils/axios"

export async function deleteConversation(id) {
  try {
    await api.delete(`/api/chat/delete-conversation/${id}`)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
