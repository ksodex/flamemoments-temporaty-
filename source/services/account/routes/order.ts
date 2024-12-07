import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

export async function Order(fastify: FastifyInstance) {
    const prisma = fastify.prisma

    fastify.get("/getOrder", async (req: FastifyRequest, reply: FastifyReply) => {
        const sessionToken = ""
        const accountId = ""

        try {
            const sessions = await prisma.session.findFirst({
                where: {
                    sessionToken: sessionToken,
                    AND: { accountId: accountId }
                },
                include: { account: true }
            })

            const account = sessions?.account

            if (!account) return reply.status(404).send({ message: "" })
        } catch(error: any) {

        }


        // await prisma.order.create({
        //     data: {
        //         account: [],
        //         orderStatus: "Created",
        //         orderedProduct: "",
                
        //     }
        // })
    })
    fastify.post("/createOrder", async (req: FastifyRequest, reply: FastifyReply) => {})
    fastify.delete("/discardOrder", async (req: FastifyRequest, reply: FastifyReply) => {})
}
