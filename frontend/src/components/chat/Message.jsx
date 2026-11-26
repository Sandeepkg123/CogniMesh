import { Zap } from "lucide-react"
import { useState } from "react"
import { getAgent } from "../../lib/agents"
import { cn } from "../../lib/utils"
import BrandMark from "../layout/BrandMark"
import Lightbox from "./Lightbox"
import Markdown from "./Markdown"
import MessageActions from "./MessageActions"

function AgentTag({ agentId, requestedAgent }) {
  const agent = getAgent(agentId)
  if (!agent) return null

  const Icon = agent.icon
  const showAuto = requestedAgent === "auto" && agentId !== "auto"

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-fg-subtle">
      {showAuto && (
        <>
          <Zap className="size-3" aria-hidden="true" />
          <span>Auto</span>
          <span aria-hidden="true">→</span>
        </>
      )}
      <Icon className="size-3" aria-hidden="true" />
      <span>{agent.label}</span>
      <span aria-hidden="true">·</span>
      <span className="font-mono text-[10.5px]">{agent.costLabel}</span>
    </div>
  )
}

export default function Message({
  message,
  index,
  onRegenerate,
  regenerateDisabled,
}) {
  const [lightbox, setLightbox] = useState(null)
  const isUser = message.role === "user"
  const content = typeof message.content === "string" ? message.content : ""
  const images = Array.isArray(message.images) ? message.images : []

  return (
    <>
      <article
        className={cn(
          "group/message flex gap-3",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && <BrandMark className="mt-0.5 size-6 shrink-0" />}

        <div
          className={cn(
            "min-w-0",
            isUser ? "flex max-w-[85%] flex-col items-end" : "flex-1"
          )}
        >
          {images.length > 0 && (
            <div className={cn("mb-3 flex flex-wrap gap-2.5", isUser && "justify-end")}>
              {images.map((src, imageIndex) => (
                <button
                  key={`${src}-${imageIndex}`}
                  type="button"
                  aria-label={`Open image ${imageIndex + 1}`}
                  onClick={() => setLightbox(src)}
                  className="overflow-hidden rounded-lg border border-border outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <img
                    src={src}
                    alt={`Generated image ${imageIndex + 1}`}
                    loading="lazy"
                    className="h-28 w-40 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {isUser ? (
            content && (
              <div className="whitespace-pre-wrap break-words rounded-[14px] rounded-br-sm border border-border bg-popover px-4 py-2.5 text-[13.5px] leading-relaxed text-foreground">
                {content}
              </div>
            )
          ) : (
            content && <Markdown>{content}</Markdown>
          )}

          {!isUser && (
            <AgentTag agentId={message.agent} requestedAgent={message.requestedAgent} />
          )}

          <MessageActions
            role={message.role}
            content={content}
            createdAt={message.createdAt}
            onRegenerate={() => onRegenerate?.(index)}
            regenerateDisabled={regenerateDisabled}
          />
        </div>
      </article>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  )
}
