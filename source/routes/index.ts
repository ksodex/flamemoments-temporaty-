import Fastify from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyHelmet from "@fastify/helmet"

import { Account } from "./default/account"
import { Shop } from "./default/shop"
import { ControlShop } from "./control/shop"

function InitializeServer(data: { cookieSecret: string, additionalPath: string }) {
    // Creating fastify instance object
    const fastify = Fastify({ logger: true })

    // Register cookie module
    fastify.register(fastifyCookie, { secret: data.cookieSecret })

    // Register helmet secure module
    fastify.register(fastifyHelmet, {
        global: true,
        frameguard: { action: "deny" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    })

    // Registrate Routes
    fastify.register(Account, { prefix: "/account" })
    fastify.register(Shop, { prefix: "/shop" })
    fastify.register(ControlShop, { prefix: `/control/${data.additionalPath}/shop` })

    return { fastify }
}

export { InitializeServer }
