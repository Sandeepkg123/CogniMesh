import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Presentation,
  Zap,
} from "lucide-react"

/**
 * Picker agents. `auto` is the default and resolves server-side; the rest are
 * the explicit agents a user can choose. File-only agents (pdfRag,
 * imageAnalyzer) are routed by the backend and never appear in the picker.
 */
export const AGENTS = [
  {
    id: "auto",
    label: "Auto",
    icon: Zap,
    description: "Picks the best agent automatically",
    credits: null,
    costLabel: "1–10",
    group: "auto",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    description: "General questions and explanations",
    credits: 1,
    costLabel: "1 cr",
    group: "everyday",
  },
  {
    id: "search",
    label: "Search",
    icon: Globe,
    description: "Live results from the web",
    credits: 5,
    costLabel: "5 cr",
    group: "everyday",
  },
  {
    id: "coding",
    label: "Coding",
    icon: Code2,
    description: "Build, debug, and architect code",
    credits: 10,
    costLabel: "10 cr",
    group: "everyday",
  },
  {
    id: "pdf",
    label: "Create PDF",
    icon: FileText,
    description: "Generate a document you can download",
    credits: 10,
    costLabel: "10 cr",
    group: "create",
  },
  {
    id: "ppt",
    label: "Create slides",
    icon: Presentation,
    description: "Generate a .pptx deck",
    credits: 10,
    costLabel: "10 cr",
    group: "create",
  },
  {
    id: "vision",
    label: "Create image",
    icon: ImageIcon,
    description: "Generate an image from a prompt",
    credits: 10,
    costLabel: "10 cr",
    group: "create",
  },
]

/** Resolved agents that only appear on a message tag, never in the picker. */
export const FILE_AGENTS = [
  {
    id: "pdfRag",
    label: "PDF Chat",
    icon: FileText,
    description: "Chat with an attached PDF",
    credits: 10,
    costLabel: "10 cr",
    group: "file",
  },
  {
    id: "imageAnalyzer",
    label: "Analyze image",
    icon: ImageIcon,
    description: "Chat with an attached image",
    credits: 10,
    costLabel: "10 cr",
    group: "file",
  },
]

export const AGENT_MAP = Object.fromEntries(
  [...AGENTS, ...FILE_AGENTS].map((agent) => [agent.id, agent])
)

export const EVERYDAY_AGENTS = AGENTS.filter((agent) => agent.group === "everyday")
export const CREATE_AGENTS = AGENTS.filter((agent) => agent.group === "create")

export function getAgent(id) {
  return AGENT_MAP[id] ?? null
}

export function agentCredits(agent) {
  return agent?.credits ?? 1
}

export function agentCostLabel(agent) {
  return agent?.costLabel ?? "1 cr"
}
