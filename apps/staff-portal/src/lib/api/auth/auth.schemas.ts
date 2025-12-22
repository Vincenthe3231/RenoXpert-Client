import { z } from 'zod'

export const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
})

export const LoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const LoginResponseSchema = z.object({
    user: UserSchema,
})

export const MeResponseSchema = z.object({
    user: UserSchema.nullable(),
})

// Types inferred from schemas
export type User = z.infer<typeof UserSchema>
export type LoginInput = z.infer<typeof LoginInputSchema>