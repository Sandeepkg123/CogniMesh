import { Check, Coins, Loader2 } from "lucide-react"
import { PLAN_RANK } from "../../lib/plans"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export default function PlanCard({
  plan,
  currentPlanId,
  popular = false,
  onUpgrade,
  loading = false,
  disabled = false,
}) {
  const isCurrent = currentPlanId === plan.id
  const currentRank = PLAN_RANK[currentPlanId] ?? 0
  const planRank = PLAN_RANK[plan.id] ?? 0
  const isDowngrade = planRank < currentRank
  const isFree = plan.amount <= 0
  const ctaDisabled = isCurrent || isFree || disabled
  const label = loading
    ? "Opening checkout..."
    : isCurrent
      ? "Current plan"
      : isFree
        ? "Free plan"
        : isDowngrade
          ? `Switch to ${plan.name}`
          : `Upgrade to ${plan.name}`
  const variant = isCurrent
    ? "secondary"
    : isFree
      ? "ghost"
      : popular
        ? "default"
        : "outline"

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-elevated p-4",
        popular && "border-primary/30"
      )}
    >
      {popular && (
        <Badge className="absolute -top-2.5 right-4 shadow-sm">
          Most popular
        </Badge>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
              {plan.name}
            </h3>
            {isCurrent && (
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] text-fg-subtle"
              >
                Current
              </Badge>
            )}
          </div>
          <p className="mt-1 text-[12px] text-fg-subtle">{plan.tagline}</p>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[22px] font-semibold tracking-tight text-foreground">
            ₹{plan.amount}
          </span>
          <span className="ml-0.5 text-[11px] text-fg-faint">/mo</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[12px] text-fg-subtle">
        <Coins className="size-3.5 text-primary" />
        {plan.credits.toLocaleString()} credits / month
      </div>

      <ul className="mt-3 space-y-1.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-[12px] leading-relaxed text-fg-subtle"
          >
            <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant={variant}
        size="lg"
        className="mt-4 w-full"
        disabled={ctaDisabled}
        onClick={() => onUpgrade?.(plan)}
        aria-busy={loading || undefined}
      >
        {loading && <Loader2 className="animate-spin" />}
        {label}
      </Button>
    </div>
  )
}
