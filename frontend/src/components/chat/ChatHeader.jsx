import { Plus } from "lucide-react"
import { useSelector } from "react-redux"
import { useNewChat } from "../../hooks/use-new-chat"
import { conversationTitle } from "../../lib/group-conversations"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import AgentPicker from "./AgentPicker"

export default function ChatHeader({ hasAttachment = false }) {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const { messages } = useSelector((state) => state.message)
  const startNewChat = useNewChat()

  const title = selectedConversation
    ? conversationTitle(selectedConversation)
    : "New chat"

  return (
    <header className="hidden h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-5 lg:flex">
      <h1 className="truncate text-[14px] font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      {messages.length > 0 && (
        <span className="shrink-0 rounded-full border border-border bg-elevated px-2 py-0.5 text-[10px] font-medium text-fg-subtle">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <AgentPicker disabled={hasAttachment} />
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="New chat"
              onClick={startNewChat}
              className="flex size-8 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Plus className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>New chat</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
