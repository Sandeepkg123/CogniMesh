import { code } from "@streamdown/code"
import { ExternalLink } from "lucide-react"
import { Streamdown } from "streamdown"
import { cn } from "../../lib/utils"

const SHIKI_THEME = ["github-light", "github-dark"]

const CONTROLS = {
  code: { copy: true, download: false },
  table: { copy: true, download: false },
}

const COMPONENTS = {
  a: ({ href, children, ...props }) => {
    const external = typeof href === "string" && /^https?:\/\//.test(href)

    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
        {...props}
      >
        {children}
        {external && (
          <ExternalLink className="ml-1 inline size-3 align-[-1px]" aria-hidden="true" />
        )}
      </a>
    )
  },
  p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-5 text-lg font-semibold tracking-tight first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold tracking-tight first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-[14px] font-semibold first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/60 pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-[12.5px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-elevated px-3 py-2 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 align-top">{children}</td>
  ),
  hr: () => <hr className="my-5 border-border" />,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  inlineCode: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground">
      {children}
    </code>
  ),
  img: ({ src, alt }) =>
    src ? (
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="my-3 max-h-80 rounded-lg border border-border object-contain"
      />
    ) : null,
}

export default function Markdown({ children, className }) {
  if (!children) return null

  return (
    <Streamdown
      className={cn("text-[13.5px] leading-relaxed text-foreground", className)}
      plugins={{ code }}
      shikiTheme={SHIKI_THEME}
      controls={CONTROLS}
      components={COMPONENTS}
      linkSafety={{ enabled: false }}
    >
      {children}
    </Streamdown>
  )
}
