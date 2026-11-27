import { getCreditPercent } from "../../lib/plans"
import { cn } from "../../lib/utils"
import { Progress } from "../ui/progress"

export default function CreditsMeter({
  credits = 0,
  total = 100,
  compact = false,
  className,
}) {
  const safeCredits = Math.max(0, Number(credits) || 0)
  const safeTotal = Math.max(0, Number(total) || 0)
  const percent = getCreditPercent(safeCredits, safeTotal)
  const low = percent <= 20
  const barClass = cn(
    "bg-muted",
    low && "[&>[data-slot=progress-indicator]]:bg-warning",
    compact ? "h-1" : "h-1.5"
  )

  if (compact) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block h-1 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
      >
        <span
          className={cn(
            "block h-full rounded-full transition-all",
            low ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </span>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] text-fg-subtle">Credits</span>
        <span className="font-mono text-[12px] tabular-nums text-foreground">
          {safeCredits.toLocaleString()}{" "}
          <span className="text-fg-faint">
            / {safeTotal.toLocaleString()}
          </span>
        </span>
      </div>
      <Progress
        value={percent}
        className={barClass}
        aria-label={`${percent}% of credits remaining`}
      />
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className={low ? "text-warning" : "text-fg-faint"}>
          {percent}% remaining
        </span>
        {low && <span className="text-warning">Low on credits</span>}
      </div>
    </div>
  )
}
