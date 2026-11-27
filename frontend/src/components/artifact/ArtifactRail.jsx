import { PanelRightOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export default function ArtifactRail({ title, onExpand }) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-3 bg-card py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Expand artifact"
            onClick={onExpand}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <PanelRightOpen className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Expand artifact</TooltipContent>
      </Tooltip>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <span
          className="max-h-full overflow-hidden text-[10px] font-medium uppercase tracking-[0.18em] text-fg-subtle"
          style={{ writingMode: "vertical-rl" }}
        >
          {title || "Artifact"}
        </span>
      </div>
    </div>
  )
}
