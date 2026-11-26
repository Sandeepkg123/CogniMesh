import { useEffect, useState } from "react"
import BrandMark from "../layout/BrandMark"

const LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"]

export default function ThinkingIndicator() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % LABELS.length)
    }, 1800)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-3 py-1" role="status" aria-live="polite">
      <BrandMark className="size-6 shrink-0" />

      <div className="flex items-center gap-2 text-[12.5px] text-fg-subtle">
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-1.5 animate-bounce rounded-full bg-fg-subtle motion-reduce:animate-none"
              style={{
                animationDelay: `${dot * 120}ms`,
                animationDuration: "900ms",
              }}
            />
          ))}
        </span>
        <span>{LABELS[index]}</span>
      </div>
    </div>
  )
}
