import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { PanelLeftClose, Plus, Search, X } from "lucide-react"
import { getConversations } from "../../features/getConversations"
import {
  setConversations,
  setSelectedConversation,
} from "../../redux/conversationSlice"
import { useNewChat } from "../../hooks/use-new-chat"
import { useRenameConversation } from "../../hooks/use-rename-conversation"
import { conversationTitle, groupConversations } from "../../lib/group-conversations"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import BrandMark from "./BrandMark"
import ConversationItem from "./ConversationItem"
import UserCard, { UserAvatar } from "./UserCard"

function RailIconButton({ label, onClick, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="flex size-9 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export default function Sidebar({
  collapsed = false,
  onToggleCollapsed,
  mobile = false,
  onNavigate,
  onOpenBilling,
}) {
  const dispatch = useDispatch()
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation
  )
  const { userData } = useSelector((state) => state.user)
  const startNewChat = useNewChat()
  const rename = useRenameConversation()

  const [query, setQuery] = useState("")
  const searchRef = useRef(null)
  const pendingFocusRef = useRef(false)

  useEffect(() => {
    if (!userData?.userId) return

    let cancelled = false

    getConversations().then((data) => {
      if (!cancelled) {
        dispatch(setConversations(Array.isArray(data) ? data : []))
      }
    })

    return () => {
      cancelled = true
    }
  }, [dispatch, userData?.userId])

  const focusSearch = useCallback(() => {
    if (collapsed) {
      pendingFocusRef.current = true
      onToggleCollapsed?.()
      return
    }

    searchRef.current?.focus()
  }, [collapsed, onToggleCollapsed])

  useEffect(() => {
    if (!collapsed && pendingFocusRef.current) {
      pendingFocusRef.current = false
      searchRef.current?.focus()
    }
  }, [collapsed])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        focusSearch()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusSearch])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return conversations

    return conversations.filter((conversation) =>
      conversationTitle(conversation).toLowerCase().includes(normalized)
    )
  }, [conversations, query])

  const groups = useMemo(() => groupConversations(filtered), [filtered])

  const handleNewChat = () => {
    startNewChat()
    rename.cancel()
    setQuery("")
    onNavigate?.()
  }

  const handleSelect = (conversation) => {
    dispatch(setSelectedConversation(conversation))
    rename.cancel()
    setQuery("")
    onNavigate?.()
  }

  if (collapsed && !mobile) {
    return (
      <div className="flex h-full w-full flex-col items-center gap-1 bg-card py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Expand sidebar"
              onClick={onToggleCollapsed}
              className="flex size-9 items-center justify-center rounded-lg outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <BrandMark className="size-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand sidebar</TooltipContent>
        </Tooltip>

        <RailIconButton label="Search chats" onClick={focusSearch}>
          <Search className="size-4" />
        </RailIconButton>

        <RailIconButton label="New chat" onClick={handleNewChat}>
          <Plus className="size-4" />
        </RailIconButton>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
          {conversations.map((conversation) => {
            const active = selectedConversation?._id === conversation._id
            const title = conversationTitle(conversation)

            return (
              <Tooltip key={conversation._id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={title}
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleSelect(conversation)}
                    className={`flex size-8 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 ${
                      active ? "bg-accent-soft" : "hover:bg-hover"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full transition-colors ${
                        active ? "bg-primary" : "bg-fg-faint"
                      }`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-56">
                  {title}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Account"
              onClick={onToggleCollapsed}
              className="mt-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <UserAvatar user={userData} size="sm" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {userData?.name || "Account"} · Expand
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full flex-col bg-card">
        <div className="flex h-14 shrink-0 items-center gap-2 px-3">
          <BrandMark />
          <span className="truncate text-[14px] font-semibold tracking-tight text-foreground">
            CogniMesh
          </span>
          <span className="rounded-full border border-border bg-elevated px-1.5 py-px text-[10px] font-medium capitalize text-fg-subtle">
            {userData?.plan || "free"}
          </span>

          <div className="ml-auto flex shrink-0 items-center">
            {mobile ? (
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={onNavigate}
                className="flex size-7 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <X className="size-4" />
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Collapse sidebar"
                    onClick={onToggleCollapsed}
                    className="flex size-7 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <PanelLeftClose className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="shrink-0 px-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-faint" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
              className="h-9 w-full rounded-md border border-border bg-elevated pr-8 pl-8 text-[13px] text-foreground outline-none transition-colors placeholder:text-fg-subtle focus:border-primary/40 focus:ring-2 focus:ring-primary/15 lg:pr-12"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border bg-card px-1 font-mono text-[10px] text-fg-faint lg:block">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="shrink-0 px-3 pb-1">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-primary/20 bg-accent-soft text-[13px] font-medium text-primary outline-none transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Plus className="size-4" />
            New chat
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <p className="text-[13px] text-fg-subtle">
                {query ? "No chats found" : "No chats yet"}
              </p>
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-[12px] text-primary hover:underline"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="text-[12px] text-primary hover:underline"
                >
                  Start your first chat
                </button>
              )}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="pt-4 first:pt-2">
                <p className="px-2 pb-1 text-[10px] font-medium tracking-[0.14em] text-fg-faint uppercase">
                  {group.label}
                </p>
                <div className="space-y-px">
                  {group.items.map((conversation) => (
                    <ConversationItem
                      key={conversation._id}
                      conversation={conversation}
                      active={selectedConversation?._id === conversation._id}
                      renaming={rename.editingId === conversation._id}
                      draft={rename.draft}
                      onDraftChange={rename.setDraft}
                      onStartRename={rename.start}
                      onCancelRename={rename.cancel}
                      onSaveRename={rename.save}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        <UserCard onOpenBilling={onOpenBilling} />
      </div>
    </>
  )
}
