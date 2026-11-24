import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers = proxyReqOpts.headers || {}

            // Never trust identity or internal-auth headers supplied by the
            // browser. The gateway is the only component allowed to set them.
            for (const key of Object.keys(proxyReqOpts.headers)) {
                const lower = key.toLowerCase()
                if (lower === "x-user-id" || lower === "x-internal-token") {
                    delete proxyReqOpts.headers[key]
                }
            }

            if (process.env.INTERNAL_SERVICE_TOKEN) {
                proxyReqOpts.headers["x-internal-token"] = process.env.INTERNAL_SERVICE_TOKEN
            }

            if (srcReq.user?.userId) {
                proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
            }

            return proxyReqOpts
        }
    })
}
