import { Check, ChevronDown, Paperclip } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import {
  CREATE_AGENTS,
  EVERYDAY_AGENTS,
  agentCredits,
  getAgent,
} from "../../lib/agents"
import { cn } from "../../lib/utils"
import { setAgent } from "../../redux/messageSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

function AgentRow({ agent, active, credits, onSelect }) {
  const Icon = agent.icon
  const cost = agentCredits(agent)
  const affordable = credits >= cost

  return (
    <DropdownMenuItem
      disabled={!affordable}
      onSelect={() => onSelect(agent.id)}
      className={cn(
        "flex items-start gap-2.5 rounded-md px-2 py-2.5",
        active && "bg-accent-soft focus:bg-accent-soft"
      )}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-fg-subtle" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
          {agent.label}
          {active && <Check className="size-3.5 text-primary" aria-hidden="true" />}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-fg-subtle">
          {agent.description}
        </span>
      </span>

      <span
        className={cn(
          "mt-0.5 max-w-[78px] shrink-0 text-right font-mono text-[10.5px] leading-snug",
          affordable ? "text-fg-subtle" : "text-warning"
        )}
      >
        {affordable ? agent.costLabel : `Needs ${cost} credits`}
      </span>
    </DropdownMenuItem>
  )
}

export default function AgentPicker({ compact = false, disabled = false, className }) {
  const dispatch = useDispatch()
  const agentId = useSelector((state) => state.message.agent)
  const credits = useSelector((state) => state.user.userData?.credits ?? 0)
  const agent = getAgent(agentId) || getAgent("auto")
  const Icon = agent.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={`Agent: ${agent.label}`}
          title={disabled ? "Remove the attachment to choose an agent" : "Choose an agent"}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg border border-border bg-transparent text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            compact ? "px-2 text-[11.5px]" : "px-2.5 text-[12px]",
            className
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          <span className="font-medium">{agent.label}</span>
          <ChevronDown className="size-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[320px] max-w-[calc(100vw-2rem)] p-1.5"
      >
        <AgentRow
          agent={getAgent("auto")}
          active={agentId === "auto"}
          credits={credits}
          onSelect={(id) => dispatch(setAgent(id))}
        />

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wider text-fg-faint">
          Everyday
        </DropdownMenuLabel>
        {EVERYDAY_AGENTS.map((item) => (
          <AgentRow
            key={item.id}
            agent={item}
            active={agentId === item.id}
            credits={credits}
            onSelect={(id) => dispatch(setAgent(id))}
          />
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wider text-fg-faint">
          Create
        </DropdownMenuLabel>
        {CREATE_AGENTS.map((item) => (
          <AgentRow
            key={item.id}
            agent={item}
            active={agentId === item.id}
            credits={credits}
            onSelect={(id) => dispatch(setAgent(id))}
          />
        ))}

        <DropdownMenuSeparator />
        <div className="flex items-start gap-2 px-2 py-2 text-[11px] leading-snug text-fg-subtle">
          <Paperclip className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>Attach a PDF or image to chat with it</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
