import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

import { Crypto } from "../../libs/crypto"

import bcrypt from "bcrypt"

const statusCodes = {
    "Not all fields were provided": 400_1,
    "User already exists": 400_2,
    "Invalid login or password": 401_0,
    "Internal Server Error": 500_0,
    "Account has been created": 201_0,
    "Login successfuly": 200_0,
}

export async function Account(fastify: FastifyInstance) {
    const saltRounds = Number(process.env.SALT_ROUNDS)

    fastify.post("/create", async (req: FastifyRequest, reply: FastifyReply) => {
        const { email, password } = req.body as { email: string, password: string }

        if (!email || !password) return reply.status(400).send({
            statusCode: 4001,
            message: "Not all fields were provided"
        })

        try {
            const existingUser = await fastify.prisma.account.findUnique({
                where: { email: email }
            })

            if (existingUser) return reply.status(400).send({
                statusCode: 4002,
                message: "User already exists"
            })

            const hashedPassword = await bcrypt.hash(password, saltRounds)

            const account = await fastify.prisma.account.create({
                data: {
                    email: email,
                    password: hashedPassword
                }
            })

            return reply.status(201).send({
                statusCode: 2010,
                message: "Account has been created",

                data: {
                    userId: account.id,
                    role: "account.role"
                }
            })
        } catch (error: any) {
            return reply.status(500).send({
                statusCode: 5000,
                message: "Internal server error"
            })
        }
    })

    // update account (all field)
    // Add field (I allow sending notifications about new products and news) isAllowedNotifyByEmail

    fastify.post("/login", async (req: FastifyRequest, reply: FastifyReply) => {
        const { email, password } = req.body as { email: string, password: string }

        if (!email || !password) return reply.status(400).send({
            statusCode: 4001,
            message: "Not all fields were provided"
        })

        const account = await fastify.prisma.account.findFirst({
            where: { email: email }
        })

        if (!account) return reply.status(401).send({
            statusCode: 4010,
            message: "Invalid login or password"
        })
        const isPasswordValid = await bcrypt.compare(password, account.password)
        if (!isPasswordValid) return reply.status(401).send({
            statusCode: 4010,
            message: "Invalid login or password"
        })

        if (account.sessionToken) {
            reply.setCookie("session", account.sessionToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                path: "/",
            }).status(200).send({
                statusCode: 2000,
                message: "Login successfuly",

                data: { accountId: account.id }
            })
        } else {
            const sessionToken = Crypto.GenerateRandomString(32) // setSessionTG prefix tga-tg ema-email + add multiple session
            const expiresAt = new Date(Date.now() + 3600000) // unused

            await fastify.prisma.account.update({
                where: { id: account.id },
                data: { sessionToken: sessionToken }
            })

            reply.setCookie("session", sessionToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                path: "/"
            }).status(200).send({
                statusCode: 2000,
                message: "Login successfuly",

                data: { accountId: account.id }
            })
        }
    })

    fastify.post("/logout", async (req: FastifyRequest, reply: FastifyReply) => {
        const { vendor } = req.query as { vendor: "email" | "telegram" }

        if (!vendor) return reply.status(400).send({ message: "Bad request" }) // setSessionTG prefix tga-tg ema-email + add multiple session

        reply.clearCookie("session")
    })
}
