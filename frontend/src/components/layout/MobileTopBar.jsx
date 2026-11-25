import { Menu, Plus } from "lucide-react"
import { useSelector } from "react-redux"
import { useNewChat } from "../../hooks/use-new-chat"
import { conversationTitle } from "../../lib/group-conversations"

export default function MobileTopBar({ onMenu }) {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const startNewChat = useNewChat()

  const title = selectedConversation
    ? conversationTitle(selectedConversation)
    : "New chat"

  return (
    <div
      className="shrink-0 border-b border-border bg-card"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-[52px] items-center gap-1 px-2">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenu}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Menu className="size-5" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-center text-[14px] font-medium tracking-tight text-foreground">
          {title}
        </h1>

        <button
          type="button"
          aria-label="New chat"
          onClick={startNewChat}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  )
}
