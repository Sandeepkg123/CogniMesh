import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react"
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  FileX2,
  Loader2,
  PanelRightClose,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import Segmented from "../ui/segmented"
import ArtifactRail from "./ArtifactRail"
import FileTabs from "./FileTabs"
import PreviewFrame from "./PreviewFrame"
import {
  buildPreviewDocument,
  canPreviewArtifact,
  getArtifactFiles,
} from "./artifact-utils"

const CodeView = lazy(() => import("./CodeView"))

function ToolbarButton({ label, onClick, disabled = false, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export default function ArtifactPanel({
  artifact,
  collapsed = false,
  onToggleCollapsed,
  onClose,
  mobile = false,
}) {
  const [selectedFileName, setSelectedFileName] = useState(null)
  const [view, setView] = useState("code")
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  const files = useMemo(() => getArtifactFiles(artifact), [artifact])
  const canPreview = canPreviewArtifact(artifact)
  const selectedIndex = files.findIndex(
    (file) => file.name === selectedFileName
  )
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0
  const activeFile = files[activeIndex] || null
  const effectiveView = canPreview ? view : "code"
  const previewDoc = useMemo(
    () => (canPreview ? buildPreviewDocument(files) : ""),
    [canPreview, files]
  )

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  if (collapsed) {
    return <ArtifactRail title={artifact?.title} onExpand={onToggleCollapsed} />
  }

  const fileCountLabel =
    files.length === 1 ? "1 file" : `${files.length} files`

  const copyFile = async () => {
    if (!activeFile?.content) return

    try {
      await navigator.clipboard.writeText(activeFile.content)
      setCopied(true)
      toast.success("Copied to clipboard")
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Could not copy this file.")
    }
  }

  const openPreview = () => {
    if (!previewDoc) return

    const blob = new Blob([previewDoc], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const CloseIcon = mobile ? X : PanelRightClose

  return (
    <div
      role="region"
      aria-label="Artifact panel"
      className="flex h-full min-h-0 flex-col bg-card"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-elevated text-fg-subtle">
          <FileCode2 className="size-3" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] leading-tight font-medium text-foreground">
            {artifact?.title || "Artifact"}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] leading-tight text-fg-subtle">
            {fileCountLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <ToolbarButton
            label={copied ? "Copied" : "Copy file"}
            onClick={copyFile}
            disabled={!activeFile?.content}
          >
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </ToolbarButton>

          {canPreview && (
            <ToolbarButton label="Open preview in new tab" onClick={openPreview}>
              <ExternalLink className="size-3.5" />
            </ToolbarButton>
          )}

          <ToolbarButton
            label={mobile ? "Close artifact" : "Collapse artifact"}
            onClick={onClose}
          >
            <CloseIcon className="size-4" />
          </ToolbarButton>
        </div>
      </header>

      {files.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-elevated text-fg-subtle">
            <FileX2 className="size-4" aria-hidden="true" />
          </div>
          <p className="text-[12px] font-medium text-foreground">No files</p>
          <p className="max-w-[220px] text-[11px] leading-relaxed text-fg-subtle">
            This artifact didn’t include any files to display.
          </p>
        </div>
      ) : (
        <>
          {effectiveView === "code" && (
            <FileTabs
              files={files}
              activeIndex={activeIndex}
              onChange={(index) => {
                setSelectedFileName(files[index]?.name || null)
                setCopied(false)
                setView("code")
              }}
            />
          )}

          {canPreview && (
            <div className="flex h-10 shrink-0 items-center border-b border-border px-3">
              <Segmented
                value={effectiveView}
                onValueChange={setView}
                options={[
                  { value: "code", label: "Code", icon: Code2 },
                  { value: "preview", label: "Preview", icon: Eye },
                ]}
              />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            {effectiveView === "preview" ? (
              <PreviewFrame files={files} />
            ) : (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center gap-2 text-[11.5px] text-fg-subtle">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    Loading editor…
                  </div>
                }
              >
                <CodeView file={activeFile} />
              </Suspense>
            )}
          </div>
        </>
      )}
    </div>
  )
}
