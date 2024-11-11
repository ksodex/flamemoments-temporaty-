import Fastify from "fastify"

import { PrismaClient } from "@prisma/client"

import fastifyCookie from "@fastify/cookie"
import fastifyHelmet from "@fastify/helmet"

import { COOKIE_SECRET } from "./config"

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}

export function InitializeServer() {
    const fastify = Fastify({ logger: true })

    fastify.decorate("prisma", new PrismaClient())

    fastify.register(fastifyCookie, { secret: COOKIE_SECRET })
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

    return { fastify }
}

