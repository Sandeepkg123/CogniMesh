import { FileText, ImageIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import { getAgent } from "../../lib/agents"

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentChip({ file, onRemove }) {
  const [preview, setPreview] = useState(null)
  const isImage = Boolean(file?.type?.startsWith("image/"))
  const agent = getAgent(file?.type === "application/pdf" ? "pdfRag" : "imageAnalyzer")

  useEffect(() => {
    if (!file || !isImage) return

    const url = URL.createObjectURL(file)
    // Object URLs are an external resource, so the effect has to publish the
    // URL back to React after creating it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  if (!file) return null

  const Icon = isImage ? ImageIcon : FileText

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-elevated px-2.5 py-2">
      {preview ? (
        <img
          src={preview}
          alt={file.name}
          className="size-9 shrink-0 rounded-md border border-border object-cover"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
          <Icon className="size-4 text-fg-subtle" aria-hidden="true" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-foreground">{file.name}</p>
        <p className="truncate text-[10.5px] text-fg-subtle">
          {formatBytes(file.size)}
          {agent ? ` · ${agent.label} · ${agent.costLabel}` : ""}
        </p>
      </div>

      <button
        type="button"
        aria-label="Remove attachment"
        onClick={onRemove}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
