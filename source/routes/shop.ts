import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

export async function Shop(fastify: FastifyInstance) {
    fastify.post("/createOrder", async (req: FastifyRequest, reply: FastifyReply) => {

    })

    fastify.get("/getCandles", async (req: FastifyRequest, reply: FastifyReply) => {
        const prisma = fastify.prisma
        
        try {
            const candles = await prisma.globalCandles.findMany()
            const resultCandles = []

            for (const candle of candles) {
                if (candle.isPublished) resultCandles.push(candle)
            }

            return reply.status(200).send({
                message: "Request success",
                candles: resultCandles
            })
        } catch (error: any) {
            return reply.status(500).send({ message: "Internal server error" })
        }
    })
}
