const DAY = 24 * 60 * 60 * 1000

export function conversationTitle(conversation) {
  const title = conversation?.title?.trim()
  if (!title || title === "New Chat") return "New chat"
  return title
}

export function groupConversations(conversations) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfYesterday = new Date(startOfToday.getTime() - DAY)
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * DAY)

  const groups = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ]

  for (const conversation of conversations) {
    const raw = conversation.updatedAt || conversation.createdAt
    const date = raw ? new Date(raw) : new Date(0)

    if (date >= startOfToday) groups[0].items.push(conversation)
    else if (date >= startOfYesterday) groups[1].items.push(conversation)
    else if (date >= sevenDaysAgo) groups[2].items.push(conversation)
    else groups[3].items.push(conversation)
  }

  return groups.filter((group) => group.items.length > 0)
}
