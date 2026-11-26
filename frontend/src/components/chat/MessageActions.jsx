import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"

function formatTime(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const actionClass =
  "flex size-6 items-center justify-center rounded-md text-fg-faint outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"

export default function MessageActions({
  role,
  content,
  createdAt,
  onRegenerate,
  regenerateDisabled = false,
}) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const timerRef = useRef(null)
  const isAssistant = role === "assistant"

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content || "")
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be unavailable in restricted contexts.
    }
  }

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-0.5 text-fg-faint opacity-100 transition-opacity lg:opacity-0 lg:group-hover/message:opacity-100 lg:focus-within:opacity-100",
        !isAssistant && "justify-end"
      )}
    >
      <span className="mr-1 text-[10.5px] tabular-nums">{formatTime(createdAt)}</span>

      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy message"}
        title={copied ? "Copied" : "Copy"}
        onClick={copy}
        className={actionClass}
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>

      {isAssistant && (
        <>
          <button
            type="button"
            aria-label="Regenerate response"
            title="Regenerate"
            disabled={regenerateDisabled}
            onClick={onRegenerate}
            className={actionClass}
          >
            <RotateCcw className="size-3.5" />
          </button>

          <button
            type="button"
            aria-label="Good response"
            aria-pressed={feedback === "up"}
            title="Good response"
            onClick={() => setFeedback(feedback === "up" ? null : "up")}
            className={cn(actionClass, feedback === "up" && "text-success")}
          >
            <ThumbsUp className="size-3.5" />
          </button>

          <button
            type="button"
            aria-label="Bad response"
            aria-pressed={feedback === "down"}
            title="Bad response"
            onClick={() => setFeedback(feedback === "down" ? null : "down")}
            className={cn(actionClass, feedback === "down" && "text-destructive")}
          >
            <ThumbsDown className="size-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
