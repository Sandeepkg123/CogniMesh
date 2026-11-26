import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import getMessages from "../features/getMessages"
import { useSendMessage } from "../hooks/use-send-message"
import { setArtifacts, setMessages } from "../redux/messageSlice"
import ChatSession from "./chat/ChatSession"

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const dispatch = useDispatch()
  const { send, stop, regenerate, isLoading } = useSendMessage()

  const [historyLoading, setHistoryLoading] = useState({ id: null, loading: false })
  const lastLoadedIdRef = useRef(null)
  const requestIdRef = useRef(0)

  const isLoadingHistory =
    historyLoading.loading && historyLoading.id === selectedConversation?._id

  useEffect(() => {
    if (!selectedConversation) {
      lastLoadedIdRef.current = null
      requestIdRef.current += 1
      dispatch(setMessages([]))
      dispatch(setArtifacts([]))
      return
    }

    // The conversation object changes when its title is updated. Only reload
    // messages when the conversation itself changes.
    if (lastLoadedIdRef.current === selectedConversation._id) return

    lastLoadedIdRef.current = selectedConversation._id
    const requestId = ++requestIdRef.current

    if (selectedConversation.title === "New Chat") {
      dispatch(setMessages([]))
      dispatch(setArtifacts([]))
      return
    }

    const loadMessages = async () => {
      setHistoryLoading({ id: selectedConversation._id, loading: true })

      try {
        const data = await getMessages(selectedConversation._id)
        if (requestIdRef.current !== requestId) return

        const messages = Array.isArray(data) ? data : []
        dispatch(setMessages(messages))

        const latestArtifactMessage = [...messages]
          .reverse()
          .find((message) => message.artifacts?.length > 0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
      } finally {
        if (requestIdRef.current === requestId) {
          setHistoryLoading({ id: selectedConversation._id, loading: false })
        }
      }
    }

    loadMessages()
  }, [selectedConversation, dispatch])

  return (
    <ChatSession
      key={selectedConversation?._id || "new"}
      send={send}
      stop={stop}
      regenerate={regenerate}
      isLoading={isLoading}
      isLoadingHistory={isLoadingHistory}
    />
  )
}

export default ChatArea
