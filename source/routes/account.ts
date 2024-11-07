import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

import { Crypto } from "../libs/crypto"

import bcrypt from "bcrypt"

export async function Account(fastify: FastifyInstance) {
    const saltRounds = Number(process.env.SALT_ROUNDS)

    fastify.post("/create", async (req: FastifyRequest, reply: FastifyReply) => {
        const { vendor } = req.query as { vendor: "email" | "telegram" }

        if (!vendor) return reply.status(400).send({ message: "Bad request" })

        switch (vendor) {
            case "email":
                const { email, password } = req.body as { email: string, password: string }

                if (!email || !password) return reply.status(400).send({ message: "Bad request" })

                const existingUser = await fastify.prisma.account.findUnique({
                    where: { email: email }
                })

                if (existingUser) return reply.status(400).send({ message: "User already exists" })

                const hashedPassword = await bcrypt.hash(password, saltRounds)

                const newUser = await fastify.prisma.account.create({
                    data: {
                        email: email,
                        password: hashedPassword
                    }
                })

                return reply.status(201).send({ message: "User registered", userId: newUser.id })
            case "telegram":
                return reply.status(501).send({ message: "Telegram authorization method is temporarily unavailable" })
            default:
                return reply.send(401).send({ message: "Vendor authorization not declared" })
        }
    })

    fastify.post("/login", async (req: FastifyRequest, reply: FastifyReply) => {
        const { vendor } = req.query as { vendor: "email" | "telegram" }

        if (!vendor) return reply.status(400).send({ message: "Bad request" })

        switch (vendor) {
            case "email":
                const { email, password } = req.body as { email: string, password: string }

                if (!email || !password) return reply.status(400).send({ message: "Bad request" })

                const account = await fastify.prisma.account.findFirst({
                    where: { email: email }
                })

                if (!account) return reply.status(400).send({ message: "Invalid login or password" })
                const isPasswordValid = await bcrypt.compare(password, account.password)
                if (!isPasswordValid) return reply.status(400).send({ message: "Invalid login or password" })

                const sessions = await fastify.prisma.account.findFirst({
                    where: { id: account.id }
                })

                if (sessions) {
                    reply.setCookie("session", sessions.sessionToken, {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                        path: "/",
                    }).status(200).send({ message: "Login successful" })
                } else {
                    const sessionToken = Crypto.GenerateRandomString(32)
                    const expiresAt = new Date(Date.now() + 3600000)

                    await fastify.prisma.account.update({
                        where: {},
                        data: {
                            sessionToken: ""
                        }
                    })

                    reply.setCookie("session", sessionToken, {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                        path: "/",
                    }).status(200).send({ message: "Login successful" })
                }
            case "telegram":
                return reply.status(501).send({ message: "Telegram authorization method is temporarily unavailable" })
            default:
                return reply.send(401).send({ message: "Vendor authorization not declared" })
        }
    })

    fastify.post("/logout", async (req: FastifyRequest, reply: FastifyReply) => {
        const { vendor } = req.query as { vendor: "email" | "telegram" }

        if (!vendor) return reply.status(400).send({ message: "Bad request" })
    })
}
