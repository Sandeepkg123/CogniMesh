import { Code2, FileText, Globe, MessageSquare } from "lucide-react"
import { useSelector } from "react-redux"
import BrandMark from "../layout/BrandMark"

const CARDS = [
  {
    id: "chat",
    title: "Ask anything",
    description: "Get answers, explanations, and ideas.",
    icon: MessageSquare,
    agent: "chat",
    prompt: "Explain ",
  },
  {
    id: "search",
    title: "Search the web",
    description: "Find current information with live results.",
    icon: Globe,
    agent: "search",
    prompt: "What's the latest on ",
  },
  {
    id: "coding",
    title: "Build something",
    description: "Generate, debug, and architect code.",
    icon: Code2,
    agent: "coding",
    prompt: "Build a ",
  },
  {
    id: "pdf",
    title: "Analyze a PDF",
    description: "Chat with a document you upload.",
    icon: FileText,
    agent: "auto",
    prompt: "Analyze this PDF",
  },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function EmptyState({ onUsePrompt, onAnalyzePdf }) {
  const userData = useSelector((state) => state.user.userData)
  const firstName = userData?.name?.trim().split(/\s+/)[0] || "there"

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
      <BrandMark className="size-9" />

      <h1 className="mt-5 text-[20px] font-semibold tracking-tight text-foreground">
        {greeting()}, {firstName}
      </h1>
      <p className="mt-1.5 max-w-[32rem] text-[13px] leading-relaxed text-fg-subtle">
        Ask a question, build something, or bring a document. Pick a starting point below.
      </p>

      <div className="mt-7 grid w-full max-w-[40rem] grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon

          return (
            <button
              key={card.id}
              type="button"
              onClick={() =>
                card.id === "pdf" ? onAnalyzePdf?.() : onUsePrompt?.(card)
              }
              className="group flex min-h-[72px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left outline-none transition-colors hover:border-primary/30 hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-fg-subtle transition-colors group-hover:text-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-foreground">
                  {card.title}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-fg-subtle">
                  {card.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
