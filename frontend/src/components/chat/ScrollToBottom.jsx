import { ArrowDown } from "lucide-react"

export default function ScrollToBottom({ visible, onClick }) {
  if (!visible) return null

  return (
    <button
      type="button"
      aria-label="Scroll to bottom"
      onClick={onClick}
      className="absolute bottom-4 right-4 z-10 flex size-8 items-center justify-center rounded-full border border-border bg-popover text-fg-subtle shadow-lg outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <ArrowDown className="size-4" />
    </button>
  )
}
