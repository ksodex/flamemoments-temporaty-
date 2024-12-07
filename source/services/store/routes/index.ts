import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

export async function Store(fastify: FastifyInstance) {
    const prisma = fastify.prisma

    fastify.get("/getProduct", async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const candles = await prisma.candleProduct.findMany({
                include: {
                    smells: true,
                    colors: true,
                    typeProduct: true
                }
            })
            
            return reply.status(200).send({
                message: "Request succesfull",
                data: { candles: candles }
            })
        } catch (error: any) {
            console.log(error)
        }
    })
}
