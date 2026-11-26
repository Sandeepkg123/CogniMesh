import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { setSelectedConversation } from "../redux/conversationSlice"
import { setAgent, setArtifacts, setMessages } from "../redux/messageSlice"

export function useNewChat() {
  const dispatch = useDispatch()

  return useCallback(() => {
    dispatch(setSelectedConversation(null))
    dispatch(setMessages([]))
    dispatch(setArtifacts([]))
    dispatch(setAgent("auto"))
  }, [dispatch])
}
