export const PLANS = Object.freeze({
    free: Object.freeze({
        id: "free",
        name: "Free",
        amount: 0,
        credits: 100,
        validity: 30
    }),
    starter: Object.freeze({
        id: "starter",
        name: "Starter",
        amount: 199,
        credits: 500,
        validity: 30
    }),
    pro: Object.freeze({
        id: "pro",
        name: "Pro",
        amount: 499,
        credits: 1000,
        validity: 30
    })
})
