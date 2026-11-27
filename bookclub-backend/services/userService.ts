
import * as z from 'zod'
import {prisma} from "../db.ts";
import bcrypt from "bcrypt";

export const userCreationRequestSchema = z.object({
    email: z.email("invalid_email"),
    name: z.string("invalid_name"),
    password: z.string("invalid_password").min(6, "password_too_short")
}, "invalid_request")

export type UserCreationRequest = z.infer<typeof userCreationRequestSchema>

export async function isExistingUser(email: string, name: string): Promise<boolean> {
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {name},
                    {email}
                ]
            }
        })
        return !!existingUser;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return true
    }
}

export async function registerUser(email: string, name: string, password: string) {
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    return await prisma.user.create({
        data: {
            email: email,
            name: name,
            password_hash: password_hash
        },
        select: {
            id: true,
        }
    })
}