import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import ChatHeader from "./chat/ChatHeader"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"
import getMessages from "../features/getMessages"
import { setArtifacts, setMessages } from "../redux/messageSlice"

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const dispatch = useDispatch()

  const lastLoadedIdRef = useRef(null)
  const requestIdRef = useRef(0)

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
      const data = await getMessages(selectedConversation._id)
      if (requestIdRef.current !== requestId) return

      const messages = Array.isArray(data) ? data : []
      dispatch(setMessages(messages))

      const latestArtifactMessage = [...messages]
        .reverse()
        .find((message) => message.artifacts?.length > 0)
      dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
    }

    loadMessages()
  }, [selectedConversation, dispatch])

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  )
}

export default ChatArea
