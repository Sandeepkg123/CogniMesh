export const PLANS = Object.freeze([
  Object.freeze({
    id: "free",
    name: "Free",
    amount: 0,
    credits: 100,
    tagline: "For getting started",
    features: [
      "Chat, search, and coding agents",
      "Community support",
    ],
  }),
  Object.freeze({
    id: "starter",
    name: "Starter",
    amount: 199,
    credits: 500,
    tagline: "For regular use",
    features: [
      "All agents, including Create",
      "Priority support",
    ],
  }),
  Object.freeze({
    id: "pro",
    name: "Pro",
    amount: 499,
    credits: 1000,
    tagline: "For power users",
    popular: true,
    features: [
      "All agents, including Create",
      "Priority support",
      "Early access to new agents",
    ],
  }),
])

export const PLAN_RANK = Object.freeze({
  free: 0,
  starter: 1,
  pro: 2,
})

export function getPlan(planId) {
  return PLANS.find((plan) => plan.id === planId) || PLANS[0]
}

export function getCreditTotal(userData) {
  const plan = getPlan(userData?.plan)
  const total = Number(userData?.totalCredits)

  return Number.isFinite(total) && total > 0 ? total : plan.credits
}

export function getCreditPercent(credits, total) {
  const safeTotal = Number(total)

  if (!Number.isFinite(safeTotal) || safeTotal <= 0) return 0

  return Math.min(
    100,
    Math.max(0, Math.round((Number(credits) || 0) / safeTotal * 100))
  )
}
