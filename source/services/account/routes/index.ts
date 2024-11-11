import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

import { Crypto } from "../../../libs/crypto"
import bcrypt from "bcrypt"

export async function Account(fastify: FastifyInstance) {
    const prisma = fastify.prisma
    const saltRounds = Number(process.env.SALT_ROUNDS)

    fastify.post("/create", async (req: FastifyRequest, reply: FastifyReply) => {
        const { email, password } = req.body as { email: string, password: string }

        if (!email || !password) return reply.status(400).send({
            statusCode: 4001,
            message: "Not all fields were provided"
        })

        try {
            const existingUser = await prisma.account.findUnique({
                where: { email: email }
            })

            if (existingUser) return reply.status(400).send({
                statusCode: 4002,
                message: "User already exists"
            })

            const hashedPassword = await bcrypt.hash(password, saltRounds)

            const account = await prisma.account.create({
                data: {
                    email: email,
                    password: hashedPassword,

                    sessions: {
                        create: {
                            ipAddress: req.ip,
                            sessionToken: Crypto.GenerateRandomString("ST", 32),
                            expiresAt: new Date(),
                            userAgent: req.headers["user-agent"] ?? "undefined",
                            lastLogin: new Date()
                        }
                    }
                },
                include: { sessions: true }
            })

            return reply.status(201).send({
                statusCode: 2010,
                message: "Account has been created",

                data: {
                    userId: account.id,
                    sessionToken: account.sessions
                }
            })
        } catch (error: any) {
            return reply.status(500).send({
                statusCode: 5000,
                message: "Internal server error"
            })
        }
    })

    fastify.post("/login", async (req: FastifyRequest, reply: FastifyReply) => {
        const { email, password } = req.body as { email: string, password: string }

        const sessionToken = req.cookies["session"]
        const userAgent = req.headers["user-agent"]

        try {
            if (sessionToken) {
                const session = await prisma.session.findFirst({
                    where: {
                        sessionToken: sessionToken,
                        AND: {
                            userAgent: userAgent,
                            ipAddress: req.ip
                        }
                    }
                })

                if (session) reply.status(200).send({ message: "Session restored" })
            } else {
                if (!email || !password) return reply.status(400).send({
                    statusCode: 4001,
                    message: "Not all fields were provided"
                })

                const account = await fastify.prisma.account.findFirst({
                    where: { email: email },
                    include: { sessions: true }
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

                const sessionToken = Crypto.GenerateRandomString("ST", 32)
                const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
                await prisma.account.update({
                    where: { id: account.id },
                    data: {
                        sessions: {
                            create: {
                                expiresAt: expiresAt,
                                ipAddress: req.ip,
                                sessionToken: sessionToken,
                                userAgent: req.headers["user-agent"] ?? "undefined",
                                lastLogin: new Date()
                            }
                        }
                    }
                })

                reply.setCookie("session", sessionToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: process.env.NODE_ENV === "production",
                    path: "/"
                }).setCookie("accountId", account.id, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: process.env.NODE_ENV === "production",
                    path: "/"
                }).status(200).send({
                    statusCode: 2000,
                    message: "Login successfully",

                    data: {
                        accountId: account.id,
                        session: sessionToken
                    }
                })
            }
        } catch (error: any) {
            return reply.status
        }
    })

    fastify.post("/logout", async (req: FastifyRequest, reply: FastifyReply) => {
        const sessionToken = req.cookies["sessionToken"]
        const accountId = req.cookies["accountId"]

        if (!sessionToken && !accountId) {
            return reply.status(400).send({ message: "Bad request" })
        }

        try {
            const res = await prisma.session.delete({
                where: {
                    accountId: accountId,
                    sessionToken: sessionToken
                }
            })

            return reply.status(200).send({ message: "Logout" })
        } catch (error: any) {
            return reply.status(500).send({ message: "Internal server error" })
        }
    })
}
