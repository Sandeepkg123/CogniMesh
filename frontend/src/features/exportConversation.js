export function exportConversation(messages, title) {
  const safeTitle = (title || "Conversation").replace(/[\\/:*?"<>|]/g, "-")
  const lines = [`# ${title || "Conversation"}`, ""]

  for (const message of messages || []) {
    const role = message.role === "assistant" ? "CogniMesh" : "You"
    const created = message.createdAt ? ` · ${message.createdAt}` : ""
    lines.push(`## ${role}${created}`, "", message.content || "")

    if (Array.isArray(message.images) && message.images.length) {
      lines.push("", ...message.images.map((image) => `![image](${image})`))
    }

    if (Array.isArray(message.artifacts) && message.artifacts.length) {
      lines.push("", "```json", JSON.stringify(message.artifacts, null, 2), "```")
    }

    lines.push("")
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${safeTitle}.md`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
