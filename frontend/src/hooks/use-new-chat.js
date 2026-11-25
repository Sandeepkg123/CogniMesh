import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { setSelectedConversation } from "../redux/conversationSlice"
import { setArtifacts, setMessages } from "../redux/messageSlice"

export function useNewChat() {
  const dispatch = useDispatch()

  return useCallback(() => {
    dispatch(setSelectedConversation(null))
    dispatch(setMessages([]))
    dispatch(setArtifacts([]))
  }, [dispatch])
}
