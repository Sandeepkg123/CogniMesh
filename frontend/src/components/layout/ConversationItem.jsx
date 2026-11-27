import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { conversationTitle } from "../../lib/group-conversations"
import { cn } from "../../lib/utils"

export default function ConversationItem({
  conversation,
  active,
  renaming,
  draft,
  onDraftChange,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onDelete,
  onSelect,
}) {
  const title = conversationTitle(conversation)

  return (
    <div className="group/row relative">
      {active && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-primary"
        />
      )}

      {renaming ? (
        <input
          autoFocus
          value={draft}
          maxLength={200}
          aria-label="Chat title"
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={() => onSaveRename(conversation)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onSaveRename(conversation)
            }
            if (event.key === "Escape") {
              event.preventDefault()
              onCancelRename()
            }
          }}
          className="h-[34px] w-full rounded-md border border-primary/40 bg-elevated px-2.5 text-[13px] text-foreground outline-none ring-2 ring-primary/15"
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-current={active ? "page" : undefined}
          onClick={() => onSelect(conversation)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onSelect(conversation)
            }
          }}
          className={cn(
            "flex h-[34px] cursor-pointer items-center rounded-md pr-8 pl-3 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
            active
              ? "bg-accent-soft text-foreground"
              : "text-muted-foreground hover:bg-hover hover:text-foreground"
          )}
        >
          <span className="truncate">{title}</span>
        </div>
      )}

      {!renaming && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Chat options"
              className={cn(
                "absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-fg-faint outline-none transition-opacity hover:bg-elevated hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50",
                active ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
              )}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40!">
            <DropdownMenuItem onSelect={() => onStartRename(conversation)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete?.(conversation)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
