import { useEffect, useRef } from "react"
import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeft,
  PanelRight,
  Plus,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useLogout } from "../../hooks/use-logout"
import { useNewChat } from "../../hooks/use-new-chat"
import { conversationTitle } from "../../lib/group-conversations"
import { setSelectedConversation } from "../../redux/conversationSlice"
import { useArtifactPanel } from "../artifact/ArtifactContext"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command"
import { Kbd } from "../ui/kbd"

export default function CommandPalette({
  open,
  onOpenChange,
  enabled = true,
  onToggleSidebar,
  onOpenBilling,
  onNavigate,
}) {
  const dispatch = useDispatch()
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation
  )
  const { hasArtifact, toggle: toggleArtifact } = useArtifactPanel()
  const startNewChat = useNewChat()
  const logout = useLogout()
  const pendingTimerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, onOpenChange, open])

  useEffect(() => {
    if (!enabled && open) onOpenChange(false)
  }, [enabled, onOpenChange, open])

  useEffect(() => {
    return () => window.clearTimeout(pendingTimerRef.current)
  }, [])

  const run = (action) => {
    onOpenChange(false)
    window.clearTimeout(pendingTimerRef.current)
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTimerRef.current = null
      action()
    }, 120)
  }

  return (
    <CommandDialog
      open={open && enabled}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search chats or run a command."
      className="top-[15%] translate-y-0 sm:max-w-[560px]"
    >
      <CommandInput placeholder="Search chats or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem
            value="New chat"
            onSelect={() =>
              run(() => {
                startNewChat()
                onNavigate?.()
              })
            }
          >
            <Plus />
            New chat
          </CommandItem>

          <CommandItem
            value="Toggle sidebar"
            onSelect={() => run(() => onToggleSidebar?.())}
          >
            <PanelLeft />
            Toggle sidebar
          </CommandItem>

          <CommandItem
            value="Toggle artifact"
            disabled={!hasArtifact}
            onSelect={() => run(() => toggleArtifact())}
          >
            <PanelRight />
            Toggle artifact
          </CommandItem>

          <CommandItem
            value="Billing"
            onSelect={() => run(() => onOpenBilling?.())}
          >
            <Coins />
            Billing
          </CommandItem>

          <CommandItem
            value="Log out"
            className="text-destructive data-selected:text-destructive"
            onSelect={() =>
              run(() => {
                void logout()
              })
            }
          >
            <LogOut />
            Log out
          </CommandItem>
        </CommandGroup>

        {conversations.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Conversations">
              {conversations.map((conversation) => (
                <CommandItem
                  key={conversation._id}
                  value={conversationTitle(conversation)}
                  data-checked={
                    selectedConversation?._id === conversation._id
                      ? "true"
                      : undefined
                  }
                  onSelect={() =>
                    run(() => {
                      dispatch(setSelectedConversation(conversation))
                      onNavigate?.()
                    })
                  }
                >
                  <MessageSquare />
                  <span className="truncate">
                    {conversationTitle(conversation)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="hidden items-center justify-between gap-3 border-t border-border px-3 py-2 text-[11px] text-fg-faint sm:flex">
        <span>Search chats and actions</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Kbd className="h-4 min-w-4 bg-card font-mono text-[10px]">
              ↑↓
            </Kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd className="h-4 min-w-4 bg-card font-mono text-[10px]">
              ↵
            </Kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <Kbd className="h-4 min-w-4 bg-card font-mono text-[10px]">
              esc
            </Kbd>
            close
          </span>
        </div>
      </div>
    </CommandDialog>
  )
}
