import { MoreHorizontal, PanelRightClose, PanelRightOpen, Pencil, Plus, Trash2, Download } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { deleteConversation } from "../../features/deleteConversation"
import { exportConversation } from "../../features/exportConversation"
import { updateConversation } from "../../features/updateConversation"
import { useNewChat } from "../../hooks/use-new-chat"
import { conversationTitle } from "../../lib/group-conversations"
import { removeConversation, setConvTitle, setSelectedConversation } from "../../redux/conversationSlice"
import { setArtifacts, setMessages } from "../../redux/messageSlice"
import { useArtifactPanel } from "../artifact/ArtifactContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import AgentPicker from "./AgentPicker"

export default function ChatHeader({ hasAttachment = false }) {
  const dispatch = useDispatch()
  const { selectedConversation } = useSelector((state) => state.conversation)
  const { messages } = useSelector((state) => state.message)
  const { hasArtifact, collapsed: artifactCollapsed, toggle: toggleArtifact } =
    useArtifactPanel()
  const startNewChat = useNewChat()

  const title = selectedConversation
    ? conversationTitle(selectedConversation)
    : "New chat"
  const hasConversation = Boolean(selectedConversation?._id)

  const handleRename = async () => {
    if (!hasConversation) return

    const currentTitle = conversationTitle(selectedConversation)
    const nextTitle = window.prompt("Rename chat", currentTitle)?.trim()
    if (!nextTitle || nextTitle === currentTitle) return

    const data = await updateConversation({
      id: selectedConversation._id,
      title: nextTitle,
    })

    if (data?._id) {
      dispatch(
        setConvTitle({
          conversationId: selectedConversation._id,
          title: nextTitle,
        })
      )
      toast.success("Chat renamed")
    } else {
      toast.error("Could not rename chat")
    }
  }

  const handleExport = () => {
    if (!hasConversation) return
    exportConversation(messages, title)
  }

  const handleDelete = async () => {
    if (!hasConversation) return

    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`
    )
    if (!confirmed) return

    const data = await deleteConversation(selectedConversation._id)
    if (!data) {
      toast.error("Could not delete chat")
      return
    }

    dispatch(removeConversation(selectedConversation._id))
    dispatch(setSelectedConversation(null))
    dispatch(setMessages([]))
    dispatch(setArtifacts([]))
    toast.success("Chat deleted")
  }

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
        {hasArtifact && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={
                  artifactCollapsed ? "Show artifact" : "Hide artifact"
                }
                onClick={toggleArtifact}
                className="flex size-8 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {artifactCollapsed ? (
                  <PanelRightOpen className="size-4" />
                ) : (
                  <PanelRightClose className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {artifactCollapsed ? "Show artifact" : "Hide artifact"}
            </TooltipContent>
          </Tooltip>
        )}
        {hasConversation && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Conversation options"
                title="Conversation options"
                className="flex size-8 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44!">
              <DropdownMenuItem onSelect={handleRename}>
                <Pencil />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExport}>
                <Download />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
