import z from "zod";
import { USER_STATUS_VALUES } from "../constants/statuses/user.statuses";

export const userSchema = z.object({
    id: z.number().optional(),
    uuid: z.string(),
    userType: z.enum(['staff', 'owner']),
    name: z.string(),
    email: z.string().email(),
    emailVerifiedAt: z.string().nullable(),
    countryCode: z.string().nullable(),
    phoneNo: z.string().nullable(),
    lastLoginAt: z.string().nullable(),
    status: z.enum(USER_STATUS_VALUES as [string, ...string[]]),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;