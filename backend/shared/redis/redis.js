import Redis from "ioredis"

if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required")
}

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true
})

redis.on("connect", () => {
    console.log("redis connected")
})

redis.on("error", (error) => {
    console.error("redis error", error.message)
})

export default redis
