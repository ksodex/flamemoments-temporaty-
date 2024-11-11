import { InitializeServer } from "../initializeServer"
import { STORE_SERVICE as STORE } from "../config"

const { fastify } = InitializeServer()

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

fastify.listen({ port: STORE.LISTEN_PORT, host: STORE.LISTEN_ADDRESS }, (err, address) => {
    if (err) throw err
    console.log(`Server listening on ${address}`)
})
