import { Menu, PanelRight, Plus } from "lucide-react"
import { useSelector } from "react-redux"
import { useNewChat } from "../../hooks/use-new-chat"
import { conversationTitle } from "../../lib/group-conversations"
import { useArtifactPanel } from "../artifact/ArtifactContext"

export default function MobileTopBar({ onMenu }) {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const { hasArtifact, openMobile } = useArtifactPanel()
  const startNewChat = useNewChat()

  const title = selectedConversation
    ? conversationTitle(selectedConversation)
    : "New chat"

  return (
    <div
      className="shrink-0 border-b border-border bg-card"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-[52px] items-center px-2">
        <div className="flex w-[76px] shrink-0 items-center">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onMenu}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <h1 className="min-w-0 flex-1 truncate text-center text-[14px] font-medium tracking-tight text-foreground">
          {title}
        </h1>

        <div className="flex w-[76px] shrink-0 items-center justify-end gap-1">
          {hasArtifact && (
            <button
              type="button"
              aria-label="Open artifact"
              onClick={openMobile}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <PanelRight className="size-5" />
            </button>
          )}

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
    </div>
  )
}
