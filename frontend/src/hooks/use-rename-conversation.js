import { useState } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { updateConversation } from "../features/updateConversation"
import { setConvTitle } from "../redux/conversationSlice"

export function useRenameConversation() {
  const dispatch = useDispatch()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)

  const start = (conversation) => {
    setEditingId(conversation._id)
    setDraft(conversation.title || "")
  }

  const cancel = () => {
    setEditingId(null)
    setDraft("")
  }

  const save = async (conversation) => {
    if (saving) return

    const title = draft.trim()
    if (!title || title === (conversation.title || "")) {
      cancel()
      return
    }

    setSaving(true)
    const data = await updateConversation({ id: conversation._id, title })
    setSaving(false)

    if (data?._id) {
      dispatch(setConvTitle({ conversationId: conversation._id, title }))
      toast.success("Chat renamed")
      cancel()
    } else {
      toast.error("Could not rename chat")
    }
  }

  return { editingId, draft, setDraft, start, cancel, save, saving }
}
