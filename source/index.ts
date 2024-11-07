import "dotenv/config"

import Fastify from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyHelmet from "@fastify/helmet"

import { PrismaClient } from "@prisma/client"

import { Account } from "./routes/account"
import { Shop } from "./routes/shop"

const host = String(process.env.LISTENING_HOST)
const port = Number(process.env.LISTENING_PORT)
const cookieSecret = String(process.env.COOKIE_SECRET)

const fastify = Fastify({ logger: true })
fastify.register(Account)
fastify.register(Shop)
fastify.register(fastifyCookie, { secret: cookieSecret })
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


fastify.decorate("prisma", new PrismaClient())
declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}

process.on("SIGINT", async () => {
    try {
        await fastify.prisma.$disconnect()
        await fastify.close()

        process.exit(0)
    } catch (err: any) {
        console.log("\n", err.message)
        process.exit(127)
    }
})

fastify.listen({ port: port, host: host }, (err, address) => {
    if (err) throw err
    console.log(`Server listening on ${address}`)
})
