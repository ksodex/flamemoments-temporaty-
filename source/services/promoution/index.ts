import { InitializeServer } from "../initializeServer"
import { PROMOUTION_SERVICE as PROMOUTION } from "../config"

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

fastify.listen({ port: PROMOUTION.LISTEN_PORT, host: PROMOUTION.LISTEN_ADDRESS }, (err, address) => {
    if (err) throw err
    console.log(`Server listening on ${address}`)
})
