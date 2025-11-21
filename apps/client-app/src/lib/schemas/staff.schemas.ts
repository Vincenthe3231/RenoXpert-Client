import z from "zod";
import { userSchema } from "./user.schemas";

export const staffSchema = userSchema.extend({
    profile: z.object({
        id: z.number().nullable(),
        larksuiteOpenId: z.string().nullable(),
        larksuiteUnionId: z.string().nullable(),
        avatarUrl: z.string().url().nullable(),
        avatarBig: z.string().url().nullable(),
        type: z.enum(['super_admin', 'admin', 'staff']),
    }),
}).omit({
    userType: true,
}).extend({
    userType: z.literal('staff'),
});

export type Staff = z.infer<typeof staffSchema>;