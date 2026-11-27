import { cn } from "@/lib/utils"

export default function Segmented({ value, onValueChange, options, className }) {
  return (
    <div
      role="group"
      className={cn(
        "grid w-full gap-1 rounded-md border border-border bg-elevated p-1",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "flex h-6 items-center justify-center gap-1.5 rounded-sm text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-accent text-foreground shadow-sm"
                : "text-fg-subtle hover:text-foreground"
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
