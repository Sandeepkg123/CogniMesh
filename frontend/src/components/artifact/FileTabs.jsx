import { FileCode2, FileJson, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

function iconForFile(name = "") {
  const lower = name.toLowerCase()
  if (lower.endsWith(".json")) return FileJson
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return FileCode2
  if (lower.endsWith(".css") || lower.endsWith(".js") || lower.endsWith(".jsx")) {
    return FileCode2
  }
  if (lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".py")) {
    return FileCode2
  }
  return FileText
}

export default function FileTabs({ files, activeIndex, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Artifact files"
      className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {files.map((file, index) => {
        const Icon = iconForFile(file.name)
        const active = index === activeIndex

        return (
          <button
            key={`${file.name}-${index}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(index)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 border-r border-border/60 px-3 text-[11px] font-medium outline-none transition-colors last:border-r-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
              active
                ? "text-foreground"
                : "text-fg-subtle hover:text-foreground"
            )}
          >
            <Icon className="size-3 shrink-0" aria-hidden="true" />
            <span className="max-w-[160px] truncate">{file.name}</span>
            {active && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
