import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import EmptyState from "./EmptyState"
import Message from "./Message"
import MessageSkeleton from "./MessageSkeleton"
import ScrollToBottom from "./ScrollToBottom"
import ThinkingIndicator from "./ThinkingIndicator"

export default function MessageList({
  isLoadingHistory,
  onUsePrompt,
  onAnalyzePdf,
  onRegenerate,
  regenerateDisabled,
}) {
  const { messages, isLoading } = useSelector((state) => state.message)
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)
  const [atBottom, setAtBottom] = useState(true)

  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" })
  }, [])

  const handleScroll = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const distance = element.scrollHeight - element.scrollTop - element.clientHeight
    setAtBottom(distance < 120)
  }, [])

  useEffect(() => {
    if (isLoadingHistory) return
    if (!atBottom) return

    requestAnimationFrame(() => {
      scrollToBottom(messages.length > 0 ? "smooth" : "auto")
    })
  }, [messages.length, isLoading, isLoadingHistory, atBottom, scrollToBottom])

  const empty = !isLoadingHistory && messages.length === 0

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[45rem] flex-col px-4 py-6 md:px-6">
          {isLoadingHistory ? (
            <MessageSkeleton />
          ) : empty ? (
            <EmptyState onUsePrompt={onUsePrompt} onAnalyzePdf={onAnalyzePdf} />
          ) : (
            <div className="space-y-6" aria-live="polite" aria-busy={isLoading}>
              {messages.map((message, index) => (
                <Message
                  key={message._id || message.id || `${message.role}-${index}`}
                  message={message}
                  index={index}
                  onRegenerate={onRegenerate}
                  regenerateDisabled={regenerateDisabled}
                />
              ))}
              {isLoading && <ThinkingIndicator />}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <ScrollToBottom visible={!atBottom} onClick={() => scrollToBottom()} />
    </div>
  )
}
