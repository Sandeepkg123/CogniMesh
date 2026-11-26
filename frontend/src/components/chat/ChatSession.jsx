import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { setAgent } from "../../redux/messageSlice"
import ChatHeader from "./ChatHeader"
import Composer from "./Composer"
import MessageList from "./MessageList"

export default function ChatSession({
  send,
  stop,
  regenerate,
  isLoading,
  isLoadingHistory,
}) {
  const dispatch = useDispatch()
  const [draft, setDraft] = useState("")
  const [attachment, setAttachment] = useState(null)
  const composerRef = useRef(null)

  // The component is keyed by conversation id, so this runs whenever the user
  // starts or switches a conversation. Agent choice is per message, not global.
  useEffect(() => {
    dispatch(setAgent("auto"))
  }, [dispatch])

  const handleUsePrompt = ({ agent, prompt }) => {
    setAttachment(null)
    dispatch(setAgent(agent))
    setDraft(prompt)
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  const handleAnalyzePdf = () => {
    dispatch(setAgent("auto"))
    setDraft("Analyze this PDF")
    composerRef.current?.openFilePicker()
  }

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <ChatHeader hasAttachment={Boolean(attachment)} />
      <MessageList
        isLoadingHistory={isLoadingHistory}
        onUsePrompt={handleUsePrompt}
        onAnalyzePdf={handleAnalyzePdf}
        onRegenerate={regenerate}
        regenerateDisabled={isLoading}
      />
      <Composer
        ref={composerRef}
        draft={draft}
        onDraftChange={setDraft}
        attachment={attachment}
        onAttachmentChange={setAttachment}
        onSend={send}
        onStop={stop}
        isLoading={isLoading}
      />
    </div>
  )
}
