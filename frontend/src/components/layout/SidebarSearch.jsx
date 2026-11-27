import { Search } from "lucide-react"
import { cn } from "../../lib/utils"

export default function SidebarSearch({ onOpen, className }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Search chats"
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-md border border-border bg-elevated px-2.5 text-left text-[13px] text-fg-subtle outline-none transition-colors hover:border-input hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <Search className="size-3.5 shrink-0 text-fg-faint" />
      <span className="min-w-0 flex-1 truncate">Search chats</span>
      <kbd className="hidden shrink-0 rounded border border-border bg-card px-1 py-px font-mono text-[10px] leading-4 text-fg-faint lg:inline-flex">
        ⌘K
      </kbd>
    </button>
  )
}
