import "dotenv/config"

import { PrismaClient } from "@prisma/client"

import { InitializeServer } from "./routes"

const host = String(process.env.LISTENING_HOST)
const port = Number(process.env.LISTENING_PORT)
const cookieSecret = String(process.env.COOKIE_SECRET)
const additionalPath = String(process.env.ADDITIONAL_PATH)

const { fastify } = InitializeServer({ cookieSecret, additionalPath })

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
