import { InitializeServer } from "../initializeServer"
import { ACCOUNT_SERVICE as ACCOUNT } from "../config"

import { Account } from "./routes/auth"

const { fastify } = InitializeServer()

fastify.register(Account, { prefix: "/account" })

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

fastify.listen({ port: ACCOUNT.LISTEN_PORT, host: ACCOUNT.LISTEN_ADDRESS }, (err, address) => {
    if (err) throw err
    console.log(`Server listening on ${address}`)
})
